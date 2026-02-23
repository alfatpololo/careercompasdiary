'use client';

import { useRouter } from 'next/navigation';
import { GameCard, GameButton, GameBadge } from '../../components/GameUI';

const studentActions = [
  {
    title: 'Catatan Harian Siswa',
    description: 'Refleksikan keputusan dan tindakan yang kamu ambil pada tahap Control.',
    action: '/control/diary',
    cta: 'Isi Catatan Harian',
  },
  {
    title: 'Evaluasi Hasil (Siswa)',
    description: 'Catat pemahamanmu mengenai kendali diri dalam karier.',
    action: '/control/evaluation-result-student',
    cta: 'Buka Evaluasi Hasil',
  },
];

const teacherActions = [
  {
    title: 'Evaluasi Proses (Guru BK)',
    description: 'Observasi keterlibatan siswa selama layanan Control.',
    action: '/control/evaluation-process-teacher',
    cta: 'Isi Evaluasi Proses',
  },
];

export default function ControlHome() {
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
          <GameBadge className="bg-emerald-500/90 border-white text-white">Stage Control</GameBadge>
          <h1 className="text-4xl font-extrabold drop-shadow">Kendali Diri & Pengambilan Keputusan</h1>
          <p className="text-lg font-semibold text-white/90 max-w-3xl mx-auto">
            Selesaikan refleksi dan evaluasi tahap Control untuk memperkuat kemampuan kendali diri dalam perjalanan Career Compass Diary.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <GameCard className="bg-gradient-to-br from-emerald-400 to-teal-600">
            <div className="space-y-4">
              <GameBadge className="bg-white/25 text-white border-white/70">Untuk Siswa</GameBadge>
              <h2 className="text-3xl font-extrabold drop-shadow">Langkah Siswa</h2>
              <p className="text-white/90 font-semibold">
                Lengkapi catatan harian serta evaluasi proses dan hasil setelah menuntaskan assessment Control.
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

          <GameCard className="bg-gradient-to-br from-indigo-400 to-purple-600">
            <div className="space-y-4">
              <GameBadge className="bg-white/25 text-white border-white/70">Untuk Guru BK / Konselor</GameBadge>
              <h2 className="text-3xl font-extrabold drop-shadow">Observasi Guru BK</h2>
              <p className="text-white/90 font-semibold">
                Dokumentasikan proses dan dampak layanan Control untuk menilai kesiapan siswa dalam mengelola keputusan karier.
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


