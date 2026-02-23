import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

const EVALUATION_STAGES = ['start', 'concern', 'control', 'curiosity', 'confidence'] as const;

// Default questions (fallback)
const DEFAULT_QUESTIONS: Record<string, { process: string[]; result: string[] }> = {
  start: {
    process: [
      'Siswa menunjukkan sikap aktif dalam proses bimbingan karier',
      'Siswa memahami aturan permainan yang ada dalam website',
      'Siswa mampu mengaplikasikan website dengan baik',
      'Siswa menunjukkan sikap antusias dalam mengikuti sesi pelaksanaan bimbingan',
      'Siswa mampu mengambarkan ketercapaian pemahaman karier'
    ],
    result: [
      'Saya memahami tujuan layanan dengan baik',
      'Saya memahami topik yang akan disajikan dalam bimbingan karier',
      'Saya merasa nyaman dengan anggota kelompok',
      'Saya bersedia mengikuti sesi berikutnya dengan antusias',
      'Saya mampu mengembangkan pemahaman kelompok akan karier'
    ]
  },
  concern: {
    process: [
      'Siswa menunjukkan sikap aktif dalam proses permainan game',
      'Siswa memahami aturan permainan yang ada dalam website career compass diary',
      'Siswa menunjukkan sikap positif terhadap kepedulian akan karier',
      'Siswa menunjukkan pemahaman materi kepedulian akan karier',
      'Siswa mampu mengambarkan kesadaran perencanaan karier'
    ],
    result: [
      'Siswa menunjukkan peningkatan pemahaman tentang pentingnya memiliki kepedulian terhadap karier masa depan mereka setelah mengikuti layanan.',
      'Siswa mampu menjelaskan kembali materi yang berkaitan dengan kepedulian terhadap karier (Concern) dengan cukup baik.',
      'Siswa menunjukkan sikap positif dan antusias dalam mengikuti kegiatan layanan yang berfokus pada perencanaan karier.',
      'Siswa dapat menjawab soal-soal gamifikasi dengan benar sebagai bukti pemahaman terhadap materi yang diberikan.',
      'Layanan gamifikasi ini berkontribusi dalam menumbuhkan kesadaran siswa tentang pentingnya merencanakan karier sejak dini.'
    ]
  },
  control: {
    process: [
      'Saya memahami tujuan kegiatan pada tahap Control (Kendali Diri)',
      'Saya memahami penjelasan materi tentang kendali diri (Control) yang disampaikan selama layanan berlangsung.',
      'Saya merasa kegiatan layanan berlangsung menarik dan membantu saya memahami pentingnya kendali diri dalam menentukan arah karier.',
      'Saya berpartisipasi aktif dalam kegiatan gamifikasi yang diberikan selama layanan.',
      'Saya merasa seluruh proses kegiatan layanan berjalan dengan baik, terarah, dan memudahkan saya dalam memahami materi yang disampaikan.'
    ],
    result: [
      'Siswa menunjukkan pemahaman tentang pentingnya kendali diri dalam mengelola dan mengarahkan jalur kariernya.',
      'Siswa mampu memahami dan menjelaskan kembali materi tentang kendali diri (Control) yang telah diberikan.',
      'Siswa memperlihatkan sikap kemandirian, tanggung jawab, dan disiplin selama serta setelah mengikuti kegiatan layanan.',
      'Siswa mampu menjawab soal-soal gamifikasi dengan baik sebagai bukti pemahaman terhadap materi yang disampaikan.',
      'Siswa menunjukkan perubahan positif dalam mengelola arah kariernya melalui peningkatan kemampuan kendali diri.'
    ]
  },
  curiosity: {
    process: [
      'Saya melaksanakan layanan dengan tujuan menumbuhkan pemahaman siswa tentang rasa ingin tahu siswa dalam eksplorasi karier.',
      'Saya memberikan penjelasan yang membantu siswa memahami pentingnya rasa ingin tahu dalam eksplorasi karier.',
      'Saya memberikan pengarahan yang jelas agar siswa memahami aturan dan tujuan dari gamifikasi yang dilakukan.',
      'Saya mengamati dan memberikan umpan balik kepada siswa selama kegiatan gamifikasi berlangsung.',
      'Saya memastikan bahwa kegiatan gamifikasi mendukung pemahaman siswa terhadap materi keingintahuan (Curiosity).'
    ],
    result: [
      'Siswa menunjukkan rasa ingin tahu yang tinggi terhadap berbagai peluang karier pada saat catatan harian.',
      'Siswa mampu menjelaskan pentingnya sikap rasa ingin tahu dalam proses eksplorasi karier.',
      'Siswa memahami materi keingintahuan (Curiosity) dengan baik setelah mengikuti kegiatan layanan.',
      'Siswa aktif dan bersemangat dalam menjawab serta menyelesaikan soal-soal gamifikasi yang diberikan.',
      'Siswa menunjukkan keberanian dalam mengemukakan ide atau pilihan karier yang diminati melalui aktivitas gamifikasi.'
    ]
  },
  confidence: {
    process: [
      'Saya menyampaikan materi tentang pentingnya sikap percaya diri dalam menghadapi tantangan karier dengan jelas dan mudah dipahami siswa.',
      'Saya membimbing siswa dalam memahami konsep kepercayaan diri (Confidence) melalui kegiatan refleksi diri.',
      'Saya megarahkan siswa agar aktif dan percaya diri dalam berpartisipasi selama layanan berlangsung.',
      'Saya mengarahkan siswa untuk menjawab soal-soal gamifikasi yang berkaitan dengan topik kepercayaan diri secara antusias dan mandiri.',
      'Saya memberikan umpan balik dan motivasi yang membangun agar siswa semakin yakin terhadap kemampuan dirinya dalam merencanakan karier.'
    ],
    result: [
      'Siswa menunjukkan pemahaman yang baik tentang pentingnya sikap percaya diri dalam menghadapi tantangan karier.',
      'Siswa dapat menjelaskan kembali isi materi tentang kepercayaan diri (Confidence) dengan cukup jelas.',
      'Siswa memperlihatkan sikap percaya diri selama mengikuti kegiatan layanan berlangsung.',
      'Siswa mampu menyelesaikan soal-soal gamifikasi dengan baik dan menunjukkan pemahaman terhadap isi materi.',
      'Siswa menunjukkan perubahan positif dalam keyakinan terhadap kemampuan diri setelah mengikuti layanan.'
    ]
  }
};

// GET /api/cms/evaluation?stage=concern
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');

    if (!stage || !EVALUATION_STAGES.includes(stage as typeof EVALUATION_STAGES[number])) {
      return NextResponse.json({ success: false, error: 'Stage parameter tidak valid' }, { status: 400 });
    }

    const doc = await adminDb.collection('cms_evaluation').doc(stage).get();
    if (doc.exists) {
      const data = doc.data();
      return NextResponse.json({ success: true, data: data?.questions || DEFAULT_QUESTIONS[stage] });
    }
    return NextResponse.json({ success: true, data: DEFAULT_QUESTIONS[stage] });
  } catch (error) {
    console.error('CMS Evaluation GET error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// POST /api/cms/evaluation
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });
    }

    const { stage, questions } = await request.json();
    if (!stage || !questions || !EVALUATION_STAGES.includes(stage)) {
      return NextResponse.json({ success: false, error: 'Stage dan questions diperlukan' }, { status: 400 });
    }

    await adminDb.collection('cms_evaluation').doc(stage).set({
      stage,
      questions,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Pernyataan evaluasi berhasil disimpan' });
  } catch (error) {
    console.error('CMS Evaluation POST error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data' }, { status: 500 });
  }
}
