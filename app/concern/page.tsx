'use client';

import { useRouter } from 'next/navigation';
import { GameCard, GameButton, GameBadge } from '../../components/GameUI';

const studentActions = [
  {
    title: 'Catatan Harian Siswa',
    description: 'Refleksikan rencana kariermu setelah memahami materi kepedulian.',
    action: '/concern/diary',
    cta: 'Isi Catatan Harian',
  },
  {
    title: 'Evaluasi Proses (Siswa)',
    description: 'Nilai keterlibatanmu selama mengikuti layanan Concern.',
    action: '/concern/evaluation-process-student',
    cta: 'Buka Evaluasi Proses',
  },
  {
    title: 'Evaluasi Hasil (Siswa)',
    description: 'Cek sejauh mana pemahamanmu tentang kepedulian karier.',
    action: '/concern/evaluation-result-student',
    cta: 'Buka Evaluasi Hasil',
  },
];

const teacherActions = [
  {
    title: 'Evaluasi Proses (Guru BK)',
    description: 'Observasi keterlibatan siswa selama layanan Concern.',
    action: '/concern/evaluation-process-teacher',
    cta: 'Isi Evaluasi Proses',
  },
  {
    title: 'Evaluasi Hasil (Guru BK)',
    description: 'Catat hasil pembelajaran siswa setelah tahap Concern.',
    action: '/concern/evaluation-result-teacher',
    cta: 'Isi Evaluasi Hasil',
  },
];

export default function ConcernHome() {
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
          <GameBadge className="bg-blue-500/90 border-white text-white">Stage Concern</GameBadge>
          <h1 className="text-4xl font-extrabold drop-shadow">Kepedulian terhadap Karier</h1>
          <p className="text-lg font-semibold text-white/90 max-w-3xl mx-auto">
            Lanjutkan perjalanan Career Compass Diary dengan mengisi catatan harian dan lembar evaluasi.
            Gunakan menu di bawah ini sesuai peranmu.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <GameCard className="bg-gradient-to-br from-sky-400 to-blue-600">
            <div className="space-y-4">
              <GameBadge className="bg-white/25 text-white border-white/70">Untuk Siswa</GameBadge>
              <h2 className="text-3xl font-extrabold drop-shadow">Langkah Siswa</h2>
              <p className="text-white/90 font-semibold">
                Lengkapi refleksi dan evaluasi setelah menyelesaikan assessment tahap Concern.
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
                Gunakan lembar evaluasi berikut untuk menilai proses dan hasil pembelajaran siswa.
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


