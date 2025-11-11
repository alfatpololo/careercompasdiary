'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { GameCard, GameButton, GameBadge } from '../../components/GameUI';

const resultLinks = [
  {
    title: 'Hasil Dimensi Adaptabilitas Karier',
    description: 'Lihat perolehan nilai pada setiap tahap Concern hingga Confidence beserta rincian skor per soal.',
    action: '/results/adaptability',
    badge: 'Adaptabilitas',
  },
  {
    title: 'Evaluasi Hasil & Proses',
    description: 'Telusuri catatan evaluasi siswa dan guru dari Start (Mari Mengenal) hingga Adaptabilitas Karier.',
    action: '/results/evaluations',
    badge: 'Evaluasi',
  },
  {
    title: 'Pretest & Posttest',
    description: 'Bandingkan capaian CAAS 1 dan CAAS 2 untuk melihat perkembangan adaptabilitas karier.',
    action: '/results/prepost',
    badge: 'Tes',
  },
  {
    title: 'Catatan Harian',
    description: 'Akses refleksi harian dari setiap tahap untuk memantau kesiapan karier secara personal.',
    action: '/results/diary',
    badge: 'Refleksi',
  },
];

export default function ResultsHub() {
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Mulai.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Diperlukan</h2>
          <p className="text-gray-600">
            Silakan login terlebih dahulu untuk melihat rangkuman hasil perjalanan kariermu.
          </p>
          <GameButton onClick={() => router.push('/login')} className="mt-6 from-blue-500 to-blue-700">
            Login
          </GameButton>
        </div>
      </div>
    );
  }

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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center text-white space-y-2">
          <GameBadge className="bg-yellow-400/90 text-emerald-800 border-white">HASIL</GameBadge>
          <h1 className="text-4xl font-extrabold drop-shadow">Hasil, Proses, Pretest, Posttest, Catatan Harian</h1>
          <p className="text-lg font-semibold text-white/90 max-w-3xl mx-auto">
            Pantau perkembangan adaptabilitas kariermu dengan rangkuman lengkap dari setiap tahap, dilengkapi statistik,
            refleksi, dan interpretasi kategori.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {resultLinks.map((link) => (
            <GameCard key={link.action} className="bg-gradient-to-br from-white/85 to-white/60 text-gray-800 border-4 border-white/70">
              <div className="space-y-3">
                <GameBadge className="bg-emerald-500/80 border-white text-white">{link.badge}</GameBadge>
                <h2 className="text-2xl font-extrabold drop-shadow-sm">{link.title}</h2>
                <p className="font-semibold text-gray-700">{link.description}</p>
                <GameButton onClick={() => router.push(link.action)} className="from-green-500 to-emerald-600">
                  Lihat Detail
                </GameButton>
              </div>
            </GameCard>
          ))}
        </div>

        <div className="flex justify-center">
          <GameButton onClick={() => router.push('/journey')} className="from-gray-400 to-gray-600">
            Kembali ke Journey Map
          </GameButton>
        </div>
      </div>
    </div>
  );
}


