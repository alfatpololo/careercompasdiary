'use client';

import { useRouter } from 'next/navigation';
import { GameCard, GameButton, GameBadge } from '../../components/GameUI';

const studentActions = [
  {
    title: 'Catatan Harian Siswa',
    description: 'Refleksikan langkah eksplorasi karier yang telah atau akan kamu lakukan.',
    action: '/curiosity/diary',
    cta: 'Isi Catatan Harian',
  },
  {
    title: 'Evaluasi Hasil (Siswa)',
    description: 'Catat pemahaman dan keberanianmu dalam mengeksplor karier.',
    action: '/curiosity/evaluation-result-student',
    cta: 'Buka Evaluasi Hasil',
  },
];

const teacherActions = [
  {
    title: 'Evaluasi Proses (Guru BK)',
    description: 'Observasi keterlibatan siswa selama layanan Curiosity.',
    action: '/curiosity/evaluation-process-teacher',
    cta: 'Isi Evaluasi Proses',
  },
];

export default function CuriosityHome() {
  const router = useRouter();

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
          <GameBadge className="bg-purple-500/90 border-white text-white">Stage Curiosity</GameBadge>
          <h1 className="text-4xl font-extrabold drop-shadow">Keingintahuan & Eksplorasi Karier</h1>
          <p className="text-lg font-semibold text-white/90 max-w-3xl mx-auto">
            Lengkapi refleksi dan evaluasi tahap Curiosity untuk menguatkan rasa ingin tahu serta keberanian mengeksplor jalur karier.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <GameCard className="bg-gradient-to-br from-purple-400 to-pink-600">
            <div className="space-y-4">
              <GameBadge className="bg-white/25 text-white border-white/70">Untuk Siswa</GameBadge>
              <h2 className="text-3xl font-extrabold drop-shadow">Langkah Siswa</h2>
              <p className="text-white/90 font-semibold">
                Isi catatan harian serta evaluasi proses dan hasil setelah menyelesaikan assessment Curiosity.
              </p>

              <div className="space-y-4">
                {studentActions.map((item) => (
                  <div key={item.action} className="bg-white/15 rounded-2xl border-2 border-white/40 p-4">
                    <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                    <p className="text-white/85 text-sm mb-4">{item.description}</p>
                    <GameButton onClick={() => router.push(item.action)} className="from-green-400 to-green-600">
                      {item.cta}
                    </GameButton>
                  </div>
                ))}
              </div>
            </div>
          </GameCard>

          <GameCard className="bg-gradient-to-br from-indigo-400 to-blue-600">
            <div className="space-y-4">
              <GameBadge className="bg-white/25 text-white border-white/70">Untuk Guru BK / Konselor</GameBadge>
              <h2 className="text-3xl font-extrabold drop-shadow">Observasi Guru BK</h2>
              <p className="text-white/90 font-semibold">
                Dokumentasikan proses dan dampak layanan Curiosity untuk melihat sejauh mana siswa berani mengeksplor karier.
              </p>

              <div className="space-y-4">
                {teacherActions.map((item) => (
                  <div key={item.action} className="bg-white/15 rounded-2xl border-2 border-white/40 p-4">
                    <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                    <p className="text-white/85 text-sm mb-4">{item.description}</p>
                    <GameButton onClick={() => router.push(item.action)} className="from-yellow-300 to-orange-500">
                      {item.cta}
                    </GameButton>
                  </div>
                ))}
              </div>
            </div>
          </GameCard>
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


