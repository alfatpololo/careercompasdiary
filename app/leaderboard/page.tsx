'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { GameCard, GameButton, GameBadge, LoadingSpinner } from '../../components/GameUI';

type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  total: number;
  percent: number;
};

const RANK_COLORS: Record<number, string> = {
  1: 'from-amber-400 to-yellow-500',
  2: 'from-slate-300 to-slate-400',
  3: 'from-amber-600 to-amber-700',
};

export default function LeaderboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) throw new Error('Gagal memuat data');
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

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
          <p className="text-gray-600 mb-6">Silakan login untuk melihat papan peringkat.</p>
          <GameButton onClick={() => router.push('/login')} className="from-blue-500 to-blue-700">
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center text-white space-y-2">
          <GameBadge className="bg-amber-500/90 text-white border-white">
            PAPAN PERINGKAT
          </GameBadge>
          <h1 className="text-2xl sm:text-3xl font-extrabold drop-shadow px-4">
            RANKING ADAPATABILITAS KARIR SISWA
          </h1>
          <p className="text-sm sm:text-base font-semibold text-white/90 max-w-2xl mx-auto px-4">
            Top 10 peringkat teratas berdasarkan hasil posttest Adaptabilitas Karier
          </p>
        </div>

        <GameCard className="bg-gradient-to-br from-white/95 to-white/85 !text-gray-900 border-4 border-white/70 overflow-hidden">
          {loading ? (
            <div className="py-16 [&_p]:!text-gray-700">
              <LoadingSpinner size="lg" text="Memuat leaderboard..." />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-600 font-semibold mb-4">{error}</p>
              <GameButton
                onClick={() => window.location.reload()}
                className="from-gray-500 to-gray-600 !text-white"
              >
                Coba Lagi
              </GameButton>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600 font-semibold">
                Belum ada data posttest. Selesaikan tahap Adaptabilitas Karier untuk melihat peringkat.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-4 border-emerald-200">
                    <th className="text-left py-3 px-4 font-extrabold text-emerald-800 w-20">Peringkat</th>
                    <th className="text-left py-3 px-4 font-extrabold text-emerald-800">Nama</th>
                    <th className="text-right py-3 px-4 font-extrabold text-emerald-800">Skor</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.userId}
                      className={`border-b-2 border-gray-100 ${
                        entry.rank <= 3 ? 'bg-amber-50/80' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-extrabold text-white ${
                            RANK_COLORS[entry.rank]
                              ? `bg-gradient-to-br ${RANK_COLORS[entry.rank]} border-2 border-white shadow`
                              : 'bg-emerald-500'
                          }`}
                        >
                          {entry.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-800">
                        {entry.username}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-extrabold text-emerald-700">
                          {entry.total}
                          <span className="text-sm font-semibold text-gray-500 ml-1">
                            / 120 ({Math.round(entry.percent)}%)
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GameCard>

        <div className="flex flex-wrap justify-center gap-3">
          <GameButton onClick={() => router.push('/results')} className="from-emerald-500 to-emerald-700">
            Kembali ke Hasil
          </GameButton>
          <GameButton onClick={() => router.push('/journey')} className="from-gray-400 to-gray-600">
            Journey Map
          </GameButton>
        </div>
      </div>
    </div>
  );
}
