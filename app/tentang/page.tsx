'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameCard, GameButton, GameBadge } from '../../components/GameUI';

const developerProfiles = [
  {
    name: 'Drs. Ahmad Syahputra, M.Pd',
    university: 'Universitas Negeri Bandung',
    email: 'ahmad.syahputra@smk.sch.id',
    address: 'Jl. Melati No. 21, Bandung',
    major: 'Bimbingan dan Konseling',
    position: 'Guru BK Utama',
    whatsapp: '+62 812-3456-7890',
  },
  {
    name: 'Sri Wulandari, S.Pd',
    university: 'Universitas Negeri Malang',
    email: 'sri.wulandari@smk.sch.id',
    address: 'Jl. Kenanga No. 45, Malang',
    major: 'Psikologi Pendidikan',
    position: 'Kepala Program Karier',
    whatsapp: '+62 813-5678-1234',
  },
  {
    name: 'Agus Pratama, S.Kom',
    university: 'Universitas Pendidikan Indonesia',
    email: 'agus.pratama@smk.sch.id',
    address: 'Jl. Cempaka No. 12, Cimahi',
    major: 'Teknologi Pendidikan',
    position: 'Pengembang Media Gamifikasi',
    whatsapp: '+62 811-9988-7766',
  },
];

const stepTitles = ['Mengapa Career Compass Diary?', 'Tim Pengembang', 'Arahkan Perjalananmu'];

export default function TentangPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const nextStep = () => setStep((prev) => Math.min(prev + 1, stepTitles.length - 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between text-white">
          <GameBadge className="bg-emerald-500/80 border-white">Tentang Platform</GameBadge>
          <div className="flex gap-2">
            <GameButton onClick={() => router.push('/')} className="from-gray-400 to-gray-600">
              Home
            </GameButton>
            <GameButton onClick={() => router.push('/results')} className="from-blue-500 to-indigo-600">
              Lihat Hasil
            </GameButton>
          </div>
        </div>

        <GameCard className="bg-gradient-to-br from-sky-400 to-blue-600">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-extrabold drop-shadow">{stepTitles[step]}</h1>
            <span className="text-white/80 font-semibold">Langkah {step + 1} / {stepTitles.length}</span>
          </div>

          {step === 0 && (
            <div className="space-y-4 text-white/95 leading-relaxed">
              <p>
                Website Career Compass Diary adalah media bimbingan karier berbasis gamifikasi yang dirancang untuk
                menumbuhkan adaptabilitas karier siswa SMK. Kami percaya bahwa di era yang serba cepat, siswa membutuhkan
                pengalaman belajar yang menyenangkan sekaligus relevan untuk mempersiapkan masa depan mereka.
              </p>
              <p>
                Melalui fitur interaktif, siswa diajak menjelajahi berbagai pilihan karier, merefleksikan kekuatan diri,
                sekaligus berlatih mengambil keputusan penting. Pendekatan gamifikasi membuat proses bimbingan terasa
                ringan, namun tetap bermakna dan terukur.
              </p>
              <p>
                Platform ini mengupas tuntas konsep Adaptabilitas Karier yang diterjemahkan dalam pengalaman belajar
                bertahap: dari Start hingga Adaptabilitas Karier. Setiap tahap mendukung siswa untuk mengenali diri,
                mengendalikan keputusan, mengeksplorasi peluang, hingga membangun rasa percaya diri yang kokoh.
              </p>
              <p>
                Mari telusuri bagaimana Career Compass Diary membantu generasi muda menghadapi tantangan global dan
                teknologi dengan lebih adaptif, siap menghadapi perubahan, dan berani mengejar impian mereka.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-white/90">
                Pengembangan platform ini melibatkan kolaborasi guru BK dan pengembang media edukasi. Berikut tiga profil
                dummy yang merepresentasikan tim di balik Career Compass Diary:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {developerProfiles.map((dev) => (
                  <div key={dev.email} className="bg-white/15 border-2 border-white/30 rounded-2xl p-4 text-white/90 space-y-2">
                    <h3 className="text-xl font-bold drop-shadow">{dev.name}</h3>
                    <p className="text-sm">{dev.position}</p>
                    <div className="text-xs space-y-1">
                      <p><span className="font-semibold">Universitas:</span> {dev.university}</p>
                      <p><span className="font-semibold">Jurusan:</span> {dev.major}</p>
                      <p><span className="font-semibold">Email:</span> {dev.email}</p>
                      <p><span className="font-semibold">Alamat:</span> {dev.address}</p>
                      <p><span className="font-semibold">WA:</span> {dev.whatsapp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-white/95">
              <p>
                Siap melihat perjalanan belajar dan adaptabilitasmu? Career Compass Diary menyediakan rangkaian laporan
                untuk memantau progress, evaluasi, hingga refleksi harian.
              </p>
              <ul className="list-disc ml-6 space-y-2 text-sm">
                <li><span className="font-semibold">Hasil Dimensi Adaptabilitas Karier:</span> lihat pencapaian Concern hingga Confidence, lengkap dengan perolehan tiap soal.</li>
                <li><span className="font-semibold">Evaluasi Proses & Hasil:</span> ikuti catatan refleksi siswa dan guru dari setiap tahap.</li>
                <li><span className="font-semibold">Pretest & Posttest:</span> bandingkan pemahaman sebelum dan sesudah program.</li>
                <li><span className="font-semibold">Catatan Harian:</span> telusuri refleksi pribadi yang memandu arah kariermu.</li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <GameButton onClick={() => router.push('/results')} className="from-yellow-300 to-orange-400">
                  Buka Halaman Hasil
                </GameButton>
                <GameButton onClick={() => router.push('/journey')} className="from-emerald-400 to-emerald-600">
                  Lanjut ke Journey
                </GameButton>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <GameButton onClick={prevStep} className="from-gray-400 to-gray-600" disabled={step === 0}>
              Sebelumnya
            </GameButton>
            <GameButton onClick={step === stepTitles.length - 1 ? () => router.push('/results') : nextStep} className="from-yellow-300 to-orange-400">
              {step === stepTitles.length - 1 ? 'Lihat Hasil' : 'Berikutnya'}
            </GameButton>
          </div>
        </GameCard>
      </div>
    </div>
  );
}


