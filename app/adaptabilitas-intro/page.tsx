'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { TextToSpeech } from '../../components/TextToSpeech';
import { GameButton, GameCard, GameBadge, LoadingSpinner } from '../../components/GameUI';

const defaultContentSections = [
  {
    id: 'introduction',
    title: 'Adaptabilitas Karier',
    content: `Adaptabilitas karier adalah kemampuan seseorang untuk merencanakan, mengatur, mengeksplorasi, dan mewujudkan transisi karier serta menghadapi perubahan dunia kerja. Dalam terminologi Savickas, adaptabilitas karier terdiri dari empat sumber daya psikologis utama :

Concern (Kepedulian/Perencanaan masa depan) yaitu kesiapan dan perhatian terhadap masa depan karier dengan memikirkan arah, mempersiapkan tujuan karier.
Control (Kendali/Keputusan diri) yaitu kemampuan mengambil tanggung jawab, membuat keputusan, dan mengelola tindakan untuk mencapai tujuan karier.
Curiosity (Rasa ingin tahu/Eksplorasi) yaitu dorongan mencari informasi, mencoba pekerjaan atau skill baru, dan mengeksplorasi jalur karier.
Confidence (Kepercayaan diri/Evaluasi kemampuan) yaitu keyakinan pada kemampuan diri untuk mengambil tindakan, menyelesaikan tugas, dan mengatasi hambatan.

Keempat sumber daya psikologis tersebut menunjukkan bahwa adaptabilitas karier adalah kemampuan merencanakan, mengendalikan, mengeksplorasi, dan percaya diri ketika menghadapi perubahan kerja.`
  },
  {
    id: 'purpose',
    title: 'Tujuan Adaptabilitas Karier',
    content: `Tujuan utama dari adaptabilitas karier ini adalah untuk menumbuhkan kesiapan siswa SMK agar mampu menyesuaikan diri dengan tuntutan dunia kerja atau bahkan berwirausaha di era modern yang serba cepat ini. Terdapat dua tujuan diantaranya adalah. 

1. Tujuan umum
Menumbuhkan kesiapan siswa SMK agar mampu menyesuaikan diri, merencanakan, dan mengambil langkah konkrit menuju dunia kerja di era modern.

2. Tujuan khusus
• Siswa dapat memahami dan menjelaskan 4 dimensi adaptabilitas karier (concern, control, curiosity, confidence).
• Siswa mampu membuat rencana karier sederhana (jangka panjang atau jangka pendek) yang realistis dan terukur.
• Siswa menunjukkan minimal 3 tindakan eksplorasi profesi (kunjungan industri, magang mini, wawancara profesional).
• Siswa meningkatkan skor reflektif/asesmen adaptabilitas (pre–post) melalui kegiatan terstruktur.
• Siswa mempraktikkan teknik pengambilan keputusan saat studi kasus transisi kerja (role-play).`
  },
  {
    id: 'characteristics',
    title: 'Karakteristik Adaptabilitas Karier',
    content: `Siswa yang memiliki adaptabilitas karier tinggi umumnya menunjukkan perilaku atau karakteristik berikut :

1. Memikirkan masa depan dan membuat target (perencanaan).
2. Bertanggung jawab atas pilihan kariernya (inisiatif dan kontrol).
3. Aktif mencoba hal baru dan bertanya tentang profesi (eksploratif).
4. Yakin pada kemampuan diri ketika menghadapi tantangan (resiliensi dan self-efficacy).
5. Fleksibel terhadap perubahan tugas/teknologi dan mau belajar keterampilan baru.
6. Mencari umpan balik dan memperbaiki rencana setelah kegagalan.`
  },
  {
    id: 'factors',
    title: 'Faktor-faktor Adaptabilitas Karier',
    content: `1. Internal (individual)
• Kepribadian (terbuka terhadap pengalaman baru, tanggung jawab).
• Kompetensi teknis dan soft skills (komunikasi, problem solving).
• Self-efficacy dan motivasi (percaya diri, memiliki semangat untuk maju).
• Pengalaman sebelumnya (magang, proyek, part-time).

2. Keluarga & Sosial
• Dukungan orang tua, ekspektasi keluarga.
• Jaringan sosial dan relasi profesional (mentor, alumni).

3. Sekolah & Pendidikan vokasi
• Kualitas kurikulum praktik dan orientasi industri.
• Ketersediaan bimbingan karir, modul adaptabilitas, dan fasilitas praktek.

4. Lingkungan kerja & ekonomi
• Perubahan teknologi, kebutuhan kompetensi baru, peluang kerja regional.
• Kebijakan pendidikan/ketenagakerjaan dan kondisi pasar kerja.

5. Kultural & Nilai
• Norma budaya mengenai pekerjaan (prioritas stabilitas vs. entrepreneurship).`
  },
  {
    id: 'guidance',
    title: 'Menumbuhkan Adaptabilitas Karier Siswa',
    content: `Kerangka teoretis untuk menumbuhkan adaptabilitas karier pada siswa SMK menekankan pengembangan keempat sumber daya adaptif Savickas melalui pengalaman penguasaan, refleksi naratif, penguatan self-efficacy, siklus pembelajaran pengalaman, dukungan ekologi, serta mekanisme monitoring dan umpan balik yang etis. Prioritas teoretisnya adalah menumbuhkan orientasi masa depan yang realistis (concern), memperkuat kapasitas pengambilan keputusan dan regulasi diri (control), menumbuhkan disposisi eksploratif (curiosity), dan membangun bukti pengalaman yang memperkuat keyakinan diri (confidence).`
  }
];

function AdaptabilitasIntroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [contentSections, setContentSections] = useState(defaultContentSections);
  const [loading, setLoading] = useState(true);
  const isPosttest = searchParams?.get('posttest') === 'true';

  useEffect(() => {
    const loadContent = async () => {
      try {
        const stage = isPosttest ? 'adaptabilitas-posttest' : 'adaptabilitas-pretest';
        const res = await fetch(`/api/cms/intro?stage=${stage}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            // Convert slides format to contentSections format
            const sections = data.data.map((slide: { key?: string; title?: string; paragraphs?: string[] | string }, idx: number) => ({
              id: slide.key || `section-${idx}`,
              title: slide.title || '',
              content: Array.isArray(slide.paragraphs) 
                ? slide.paragraphs.join('\n') 
                : (typeof slide.paragraphs === 'string' ? slide.paragraphs : '')
            })).filter((section: { title: string; content: string }) => section.title || section.content);
            if (sections.length > 0) {
              setContentSections(sections);
            } else {
              // Use default content if converted sections are empty
              setContentSections(defaultContentSections);
            }
          } else {
            // Use default content
            setContentSections(defaultContentSections);
          }
        } else {
          // Use default content on error
          setContentSections(defaultContentSections);
        }
      } catch (error) {
        console.error('Error loading adaptabilitas intro:', error);
        // Use default content on error
        setContentSections(defaultContentSections);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [isPosttest]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="bg-white bg-opacity-90 rounded-lg p-8 text-center">
          <p className="text-gray-800 mb-4">Anda harus login terlebih dahulu</p>
          <button onClick={() => router.push('/login')} className="bg-blue-500 text-white px-6 py-2 rounded">
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="bg-white bg-opacity-90 rounded-lg p-8 text-center">
          <p className="text-gray-800">Memuat konten...</p>
        </div>
      </div>
    );
  }

  const section = contentSections[currentSection];
  const isLastSection = currentSection === contentSections.length - 1;

  return (
    <div className="min-h-screen" style={{
      backgroundImage: 'url(/Background_Mulai.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="max-w-6xl mx-auto p-6">
        {/* Title + Badges */}
        <div className="absolute top-4 left-4 z-10 space-y-3">
          <GameBadge className="bg-yellow-400/90 text-emerald-800 border-white">Adaptabilitas Karier</GameBadge>
          <div className="grid grid-cols-2 gap-2">
            <GameBadge className="bg-blue-500/80">Concern</GameBadge>
            <GameBadge className="bg-green-500/80">Control</GameBadge>
            <GameBadge className="bg-purple-500/80">Curiosity</GameBadge>
            <GameBadge className="bg-orange-500/80">Confidence</GameBadge>
          </div>
        </div>

        {/* Content Card Game Style */}
        <GameCard className="mt-28">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-3xl font-extrabold drop-shadow">{section.title}</h2>
            <div className="[&_svg]:!text-white [&_svg:hover]:!text-white [&_svg]:!fill-white [&_svg.text-red-500]:!text-white">
              <TextToSpeech text={`${section.title}. ${section.content}`} />
            </div>
          </div>
          <div className="text-white/95 whitespace-pre-line font-semibold">
            {section.content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <GameButton onClick={() => router.push('/journey')}>Home</GameButton>
            <div className="flex gap-3">
              {currentSection > 0 && (
                <GameButton onClick={() => setCurrentSection(currentSection - 1)} className="from-blue-400 to-blue-600">Previous</GameButton>
              )}
              <GameButton
                onClick={() => {
                  if (isLastSection) {
                    // Redirect ke diary, dengan query parameter posttest jika ini posttest
                    if (isPosttest) {
                      router.push('/adaptabilitas/diary?posttest=true');
                    } else {
                      router.push('/adaptabilitas/diary');
                    }
                  } else {
                    setCurrentSection(currentSection + 1);
                  }
                }}
                className="from-green-400 to-green-600"
              >
                Next
              </GameButton>
            </div>
          </div>
        </GameCard>
      </div>
    </div>
  );
}

export default function AdaptabilitasIntro() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Mulai.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <LoadingSpinner size="lg" text="Memuat..." fullScreen={false} />
      </div>
    }>
      <AdaptabilitasIntroContent />
    </Suspense>
  );
}

