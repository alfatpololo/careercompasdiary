import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

const CAAS_STAGES = ['caas1', 'caas2'] as const;
type CaasStage = (typeof CAAS_STAGES)[number];

export type CaasQuestions = {
  concern: string[];
  control: string[];
  curiosity: string[];
  confidence: string[];
};

function isCaasStage(s: string): s is CaasStage {
  return CAAS_STAGES.includes(s as CaasStage);
}

const DEFAULT_QUESTIONS: CaasQuestions = {
  concern: [
    'Membayangkan seperti apa karier saya di masa depan',
    'Menyadari bahwa pilihan hari ini menentukan masa depan saya',
    'Saya mempersiapkan masa depan',
    'Saya menyadari akan pilihan-pilihan pendidikan dan pilihan karir yang harus saya buat',
    'Merencanakan bagaimana cara mencapai tujuan saya',
    'Saya memikirkan mengenai karir saya',
  ],
  control: [
    'Menjaga diri agar tetap optimis',
    'Saya membuat keputusan sendiri',
    'Bertanggung jawab atas tindakan saya',
    'Tetap teguh dengan keyakinan saya',
    'Mengandalkan kemampuan diri sendiri',
    'Saya melakukan apa yang benar menurut saya',
  ],
  curiosity: [
    'Mengeksplorasi lingkungan sekitar',
    'Mencari peluang-peluang untuk berkembang',
    'Mencari tahu Jalan lain sebelum menentukan pilihan',
    'Mengamati cara-cara yang berbeda dalam melakukan sesuatu',
    'Menyelidiki secara lebih dalam pertanyaan-pertanyaan yang saya miliki',
    'Menjadi ingin tahu tentang peluang-peluang baru',
  ],
  confidence: [
    'Mengerjakan tugas secara efisien',
    'Menjaga dalam melakukan sesuatu dengan baik',
    'Mempelajari keterampilan-ketrampilan baru',
    'Bekerja dengan kemampuan saya',
    'Saya berusaha mengatasi hambatan-hambatan',
    'Menyelesaikan masalah-masalah yang saya hadapi',
  ],
};

const DEFAULT_CAAS: Record<CaasStage, { introTitle: string; introContent: string; instructionTitle: string; instructionContent: string; questions: CaasQuestions }> = {
  caas1: {
    introTitle: 'Selamat Datang! 🌟',
    introContent: `Halo, teman-teman! 👋😊
Kami ingin mengajak kalian untuk berpartisipasi dalam pengisian kuesioner ini. Kuesioner ini dirancang khusus untuk memahami bagaimana kalian merencanakan masa depan dan mengembangkan potensi diri. ✨

Jawablah setiap pertanyaan dengan jujur sesuai dengan apa yang kalian rasakan dan pikirkan. Tidak ada jawaban benar atau salah yang terpenting adalah menjadi diri sendiri! ✅

Kami sangat menghargai waktu dan kejujuran kalian. Hasil dari kuesioner ini akan digunakan untuk tujuan penelitian dan pengembangan, tanpa ada kepentingan lain. Jadi, yuk, bantu kami dengan mengisi kuesioner ini secara santai dan sesuai dengan jati diri kalian! 🚀💡

Terima kasih banyak atas partisipasinya! Semoga langkah kecil ini bisa membantu kalian memahami dan merancang masa depan yang lebih cerah. 🌟💪

Silakan isi setiap pertanyaan dengan jujur dan sepenuh hati. Tulis jawaban yang benar-benar mencerminkan dirimu sendiri, sesuai dengan pengalaman, pemikiran, dan perasaanmu selama ini. Tidak ada jawaban yang salah atau benar yang paling penting adalah jawaban itu datang dari dirimu sendiri, bukan karena ingin terlihat baik atau meniru orang lain.`,
    instructionTitle: 'Petunjuk Pengisian 📋',
    instructionContent: `Setiap orang menggunakan kekuatan yang berbeda-beda dalam membangun karirnya. Tidak ada orang yang hebat dalam segala hal, setiap orang lebih kuat dalam beberapa hal dibanding dalam hal-hal lainnya. Silahkan anda tetapkan seberapa kuat anda mengembangkan kemampuan-kemampuan di bawah ini menggunakan skala berikut dengan memberikan tanda lingkaran pada nomor yang sesuai.

Berikut adalah keterangan jawaban:
• 5 = Paling kuat (PK)
• 4 = Sangat kuat (SK)
• 3 = Kuat (K)
• 2 = Cukup kuat (CK)
• 1 = Tidak kuat (TK)

Selanjutnya, TERDAPAT 4 KOLOM yang akan anda isi dengan jawaban yang benar‑benar mencerminkan pengalaman dan kondisi nyata Anda.
1. Career concern
2. Career control
3. Career curiosity
4. Career confidence.`,
    questions: DEFAULT_QUESTIONS,
  },
  caas2: {
    introTitle: 'Posttest Adaptabilitas Karier 📊',
    introContent: `Ini adalah kuesioner posttest untuk mengukur perkembangan adaptabilitas karier Anda setelah menyelesaikan seluruh tahap Journey (Concern, Control, Curiosity, Confidence).

Jawablah setiap pertanyaan dengan jujur sesuai dengan kondisi Anda saat ini. Hasil akan dibandingkan dengan pretest untuk melihat perkembangan. ✨

Terima kasih atas partisipasinya!`,
    instructionTitle: 'Petunjuk Pengisian 📋',
    instructionContent: `Setiap orang menggunakan kekuatan yang berbeda-beda dalam membangun karirnya. Silahkan tetapkan seberapa kuat Anda mengembangkan kemampuan-kemampuan di bawah ini menggunakan skala berikut.

Keterangan jawaban:
• 5 = Paling kuat (PK)
• 4 = Sangat kuat (SK)
• 3 = Kuat (K)
• 2 = Cukup kuat (CK)
• 1 = Tidak kuat (TK)

4 KOLOM yang akan Anda isi:
1. Career concern
2. Career control
3. Career curiosity
4. Career confidence.`,
    questions: DEFAULT_QUESTIONS,
  },
};

function ensureQuestions(q: unknown): CaasQuestions {
  if (q && typeof q === 'object' && 'concern' in q && 'control' in q && 'curiosity' in q && 'confidence' in q) {
    const o = q as Record<string, unknown>;
    const arr = (key: string) => Array.isArray(o[key]) ? (o[key] as string[]).slice(0, 6) : DEFAULT_QUESTIONS[key as keyof CaasQuestions];
    return {
      concern: arr('concern').length === 6 ? arr('concern') : DEFAULT_QUESTIONS.concern,
      control: arr('control').length === 6 ? arr('control') : DEFAULT_QUESTIONS.control,
      curiosity: arr('curiosity').length === 6 ? arr('curiosity') : DEFAULT_QUESTIONS.curiosity,
      confidence: arr('confidence').length === 6 ? arr('confidence') : DEFAULT_QUESTIONS.confidence,
    };
  }
  return DEFAULT_QUESTIONS;
}

// GET /api/cms/caas?stage=caas1|caas2
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');

    if (!stage || !isCaasStage(stage)) {
      return NextResponse.json({ success: false, error: 'Parameter stage diperlukan (caas1 atau caas2)' }, { status: 400 });
    }

    const doc = await adminDb.collection('cms_caas').doc(stage).get();
    const defaultData = DEFAULT_CAAS[stage];

    if (doc.exists) {
      const data = doc.data();
      return NextResponse.json({
        success: true,
        data: {
          introTitle: data?.introTitle ?? defaultData.introTitle,
          introContent: data?.introContent ?? defaultData.introContent,
          instructionTitle: data?.instructionTitle ?? defaultData.instructionTitle,
          instructionContent: data?.instructionContent ?? defaultData.instructionContent,
          questions: ensureQuestions(data?.questions ?? defaultData.questions),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { ...defaultData, questions: defaultData.questions },
    });
  } catch (error) {
    console.error('CMS CAAS GET error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// POST /api/cms/caas
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });
    }

    const body = await request.json();
    const { stage, introTitle, introContent, instructionTitle, instructionContent, questions } = body;

    if (!stage || !isCaasStage(stage)) {
      return NextResponse.json({ success: false, error: 'Stage harus caas1 atau caas2' }, { status: 400 });
    }

    const questionsToSave = ensureQuestions(questions ?? DEFAULT_QUESTIONS);

    await adminDb.collection('cms_caas').doc(stage).set({
      stage,
      introTitle: introTitle ?? '',
      introContent: introContent ?? '',
      instructionTitle: instructionTitle ?? '',
      instructionContent: instructionContent ?? '',
      questions: questionsToSave,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true, message: 'CMS CAAS berhasil disimpan' });
  } catch (error) {
    console.error('CMS CAAS POST error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data' }, { status: 500 });
  }
}
