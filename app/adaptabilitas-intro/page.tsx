'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { TextToSpeech } from '../../components/TextToSpeech';
import { GameButton, GameCard, GameBadge } from '../../components/GameUI';

const contentSections = [
  {
    id: 'introduction',
    title: 'Pengenalan Adaptabilitas Karier',
    content: `Adaptabilitas Karier adalah Kemampuan untuk menyesuaikan diri terhadap perubahan di suatu lingkungan dan perkembangan karier disebut adaptabilitas karier. Konsep ini menjadi sangat relevan dalam lingkungan kerja yang selalu berubah, di mana teknologi serta dinamika pasar mempengaruhi cara orang menjalani pekerjaan dan karier mereka. Menurut Savickas (2013), terdapat empat komponen utama dari adaptabilitas karier: kontrol, kepercayaan, keterampilan, dan komitmen. Individu yang memiliki tingkat adaptabilitas yang tinggi biasanya lebih siap untuk menghadapi tantangan dan memanfaatkan peluang yang ada.`
  },
  {
    id: 'components',
    title: 'Komponen Utama yang Dapat Diadaptasi untuk Siswa',
    content: `Concern (Kepedulian): Membantu siswa menyadari pentingnya merencanakan masa depan karier mereka, misalnya melalui tugas refleksi: "Bagaimana gambaran saya dalam 5–10 tahun ke depan?"
Control (Pengendalian): Mendorong siswa merasakan agen terhadap pilihan karier. misalnya, menentukan jurusan di SMA atau program ekstrakurikuler yang relevan.
Curiosity (Keingintahuan): Mengajak siswa mengeksplorasi berbagai profesi melalui kunjungan industri, wawancara alumni, atau simulasi peran (role play).
Confidence (Keyakinan Diri): Membangun rasa percaya diri siswa melalui pengalaman kecil. misalnya tugas presentasi terkait prospek karier atau keterampilan yang mereka miliki.`
  },
  {
    id: 'purpose',
    title: 'Tujuan Pengembangan Adaptabilitas Karier',
    content: `Tujuan pengembangan Adaptabilitas Karier kapasitas karier memiliki banyak variasi dan melibatkan berbagai elemen yang mendukung kesuksesan seseorang di dunia pekerjaan. Salah satu tujuan utamanya adalah untuk mempersiapkan individu menghadapi perubahan yang berlangsung cepat dalam lingkungan kerja. Dengan tingkat fleksibilitas yang baik, individu dapat lebih gampang menyesuaikan diri dengan tuntutan pekerjaan yang baru, seperti inovasi teknologi dan pergeseran pasar. Tujuan dari adaptabilitas karier juga mencakup pembentukan jaringan profesional yang solid. Individu yang mampu beradaptasi dengan baik lebih mungkin membangun relasi dengan orang lain dalam industri mereka, yang bisa membuka peluang baru. Dengan demikian, tujuan dari pengembangan adaptabilitas karier tidak hanya terfokus pada aspek individu, tetapi juga mencakup interaksi sosial dan profesional yang dapat meningkatkan peluang dalam karier.`
  },
  {
    id: 'characteristics',
    title: 'Karakteristik Adaptabilitas Karier',
    content: `Berikut poin-poin inti yang harus ada dalam bagian Karakteristik Individu dalam Adaptabilitas Karier:
Kemampuan Beradaptasi: Fleksibilitas dalam menghadapi perubahan dan tantangan baru, Penggunaan berbagai strategi untuk menyelesaikan masalah dalam konteks yang berbeda
Keterbukaan terhadap Pengalaman Baru (Openness): Kesediaan menjelajahi hal-hal baru dan belajar dari situasi baru, Keterbukaan ide dan perspektif yang mendukung penyesuaian diri
Sikap Positif: Optimisme dalam menghadapi ketidakpastian dan stres, Keyakinan diri bahwa tantangan dapat diatasi
Ketahanan (Resilience): Kemampuan pulih (bounce back) setelah kegagalan atau rintangan, Belajar dan tumbuh dari pengalaman sulit
Keterampilan Interpersonal: Komunikasi efektif dengan berbagai pihak, Kemampuan membangun dan memelihara jaringan profesional
Pengendalian Diri (Self-Control): Manajemen emosi saat menghadapi situasi menekan, Disiplin dalam merencanakan dan mengambil langkah karier
Kesadaran Diri (Self-Awareness): Pemahaman atas kekuatan, nilai, dan minat pribadi, Refleksi rutin untuk mengevaluasi tujuan dan kemajuan
Proaktivitas: Inisiatif dalam mencari peluang belajar dan pengembangan, Keberanian mengambil keputusan dan bertindak sebelum keadaan mendesak
Semua poin di atas saling melengkapi dan memengaruhi satu sama lain dalam membentuk adaptabilitas karier yang kokoh.`
  },
  {
    id: 'factors',
    title: 'Faktor-faktor Adaptabilitas Karier',
    content: `Berikut poin-poin inti yang harus ada dalam Faktor‐faktor yang Mempengaruhi Adaptabilitas Karier:
Faktor Internal
Kepribadian (Personality Traits): keterbukaan (openness), fleksibilitas, dan kecenderungan terhadap inovasi
Motivasi dan Inisiatif: dorongan untuk mencari peluang, menetapkan tujuan, dan proaktif menghadapi tantangan (Xie et al., 2016)
Keterampilan (Skills & Competencies): hard skills (teknis) dan soft skills (komunikasi, problem solving) yang relevan dengan tuntutan pekerjaan
Sikap dan Keyakinan Diri: optimisme, self-efficacy, serta rasa kontrol atas proses karier sendiri
Faktor Eksternal
Budaya dan Struktur Organisasi: lingkungan kerja yang inovatif, fleksibel, dan mendukung pembelajaran (Savickas, 2002)
Kesempatan Pengembangan: akses ke pelatihan, workshop, mentoring, dan proyek lintas fungsi (Wang & Li, 2024)
Dukungan Sosial: peran keluarga, teman, kolega, dan jaringan profesional dalam memberikan dorongan dan umpan balik (Rudolph et al., 2019)
Kebijakan dan Sistem: kebijakan perusahaan (mis. work‐from‐home, job rotation), sistem reward, dan kesempatan promosi
Interaksi Antarfaktor
Bagaimana faktor internal (mis. motivasi tinggi) memanfaatkan kesempatan eksternal (mis. program pelatihan) untuk meningkatkan adaptabilitas
Sinergi antara dukungan sosial dan kepercayaan diri dalam mempercepat proses penyesuaian diri di tempat kerja
Dengan mencakup semua faktor di atas, intervensi bimbingan karier dapat dibuat lebih komprehensif dan terfokus untuk memperkuat adaptabilitas individu dalam berbagai konteks profesi.`
  },
  {
    id: 'guidance',
    title: 'Bimbingan Karier melalui Career Construction Theory (CCT)',
    content: `Berikut poin-poin inti yang harus ada dalam Bimbingan Karier melalui Career Construction Theory (CCT) untuk Mengembangkan Adaptabilitas Karier Siswa:
Pengembangan Narasi Pribadi
Alat Bantu Naratif
Pelatihan Keterampilan Adaptasi
Fasilitasi Refleksi dan Umpan Balik
Pembangunan Jaringan Dukungan Sosial
Integrasi Pengembangan Karakter dan Nilai
Perencanaan dan Tindakan Konkret
Evaluasi Berkelanjutan
Dengan elemen-elemen di atas, bimbingan karier berbasis CCT akan lebih komprehensif dan efektif dalam memperkuat kemampuan adaptasi karier siswa.`
  }
];

export default function AdaptabilitasIntro() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);

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
            <TextToSpeech text={`${section.title}. ${section.content}`} />
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
                    router.push('/adaptabilitas/diary');
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

