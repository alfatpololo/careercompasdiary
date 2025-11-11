'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton } from '../../../components/GameUI';

type DiaryDoc = {
  id: string;
  stage?: string;
  judul?: string;
  isi?: string;
  tanggal?: string;
  createdAt?: string;
  nama?: string;
};

type DiaryResponse = {
  diaries: DiaryDoc[];
};

const STAGE_LABELS: Record<string, { title: string; color: string }> = {
  start: { title: 'Start (Mari Mengenal)', color: 'bg-blue-500/80' },
  concern: { title: 'Concern', color: 'bg-sky-500/80' },
  control: { title: 'Control', color: 'bg-emerald-500/80' },
  curiosity: { title: 'Curiosity', color: 'bg-purple-500/80' },
  confidence: { title: 'Confidence', color: 'bg-orange-500/80' },
  adaptabilitas: { title: 'Adaptabilitas Karier', color: 'bg-yellow-500/80' },
};

function formatDate(value?: string) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

export default function DiaryResults() {
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/diary?userId=${encodeURIComponent(user.uid)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Gagal memuat catatan harian');
        }
        const data = (await res.json()) as DiaryResponse;
        setEntries(data.diaries || []);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('[Diary Results] fetch error:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [user?.uid]);

  const grouped = useMemo(() => {
    const map = new Map<string, DiaryDoc[]>();
    entries.forEach((entry) => {
      const stage = entry.stage || 'start';
      if (!map.has(stage)) {
        map.set(stage, []);
      }
      map.get(stage)?.push(entry);
    });

    for (const [, arr] of map) {
      arr.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.tanggal || '').getTime();
        const dateB = new Date(b.createdAt || b.tanggal || '').getTime();
        return dateB - dateA;
      });
    }

    return Array.from(map.entries()).sort((a, b) => {
      const order = ['start', 'concern', 'control', 'curiosity', 'confidence', 'adaptabilitas'];
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });
  }, [entries]);

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
            Silakan login terlebih dahulu untuk melihat catatan harian perjalanan kariermu.
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between text-white">
          <div>
            <GameBadge className="bg-orange-400/90 text-emerald-900 border-white">
              Catatan Harian
            </GameBadge>
            <h1 className="text-3xl font-extrabold drop-shadow mt-2">
              Rekap Refleksi Tiap Tahap
            </h1>
            <p className="text-white/85 font-semibold max-w-3xl">
              Setiap catatan memuat pemikiran, rencana, serta refleksi yang kamu tuliskan setelah menyelesaikan
              tahap tertentu. Gunakan catatan ini sebagai bahan diskusi bersama guru BK maupun orang tua.
            </p>
          </div>
          <GameButton onClick={() => router.push('/results')} className="from-gray-400 to-gray-600">
            Menu Hasil
          </GameButton>
        </div>

        {loading ? (
          <GameCard className="bg-white/80 text-center text-gray-700 font-semibold">
            Memuat catatan harian...
          </GameCard>
        ) : error ? (
          <GameCard className="bg-red-100 border-2 border-red-300 text-red-700 font-semibold">
            {error}
          </GameCard>
        ) : entries.length === 0 ? (
          <GameCard className="bg-white/85 text-center text-gray-700 font-semibold">
            Belum ada catatan harian yang tersimpan. Selesaikan diary pada setiap stage untuk melihat progresmu.
          </GameCard>
        ) : (
          grouped.map(([stageId, items]) => {
            const stageMeta = STAGE_LABELS[stageId] ?? {
              title: stageId,
              color: 'bg-gray-500/80',
            };

            return (
              <GameCard
                key={stageId}
                className="bg-gradient-to-br from-white/90 to-white/60 text-gray-800 border-4 border-white/70 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <GameBadge className={`${stageMeta.color} border-white text-white`}>
                    {stageMeta.title}
                  </GameBadge>
                  <GameButton
                    onClick={() => {
                      if (stageId === 'start') router.push('/adaptabilitas/diary');
                      else if (stageId === 'adaptabilitas') router.push('/adaptabilitas/diary');
                      else router.push(`/${stageId}/diary`);
                    }}
                    className="from-green-500 to-emerald-600"
                  >
                    Tambah Catatan
                  </GameButton>
                </div>

                <div className="space-y-4">
                  {items.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white/75 rounded-2xl border-2 border-white/60 p-4 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {entry.judul || 'Catatan Tanpa Judul'}
                        </h3>
                        <span className="text-xs font-semibold text-gray-500">
                          {formatDate(entry.createdAt || entry.tanggal)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-500">
                        Penulis: {entry.nama || user.displayName || user.email}
                      </p>
                      <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed">
                        {entry.isi || 'Belum ada isi catatan.'}
                      </div>
                    </div>
                  ))}
                </div>
              </GameCard>
            );
          })
        )}

        <div className="flex justify-between">
          <GameButton onClick={() => router.push('/results')} className="from-gray-400 to-gray-600">
            Kembali ke Hasil
          </GameButton>
          <GameButton onClick={() => router.push('/journey')} className="from-blue-500 to-indigo-600">
            Lihat Journey Map
          </GameButton>
        </div>
      </div>
    </div>
  );
}


