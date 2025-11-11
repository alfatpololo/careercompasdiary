'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton } from '../../../components/GameUI';
import {
  weightedAssessment,
  weightedStageOrder,
  type WeightedStageId,
  scoreToCategory,
} from '../../../lib/stageContent';

type QuizDoc = {
  id: string;
  scores?: Record<string, number>;
  total?: number;
  percent?: number;
  category?: string;
  createdAt?: string;
};

type QuizResponse = {
  results: QuizDoc[];
};

type StageAttempt = {
  id: string;
  stage: string;
  score: number;
  passed: boolean;
  createdAt: string;
};

type StageResponse = {
  attempts: StageAttempt[];
};

const STAGE_LABELS: Record<WeightedStageId, string> = {
  concern: 'Concern',
  control: 'Control',
  curiosity: 'Curiosity',
  confidence: 'Confidence',
};

const QUIZ_MAX_PER_STAGE = 30; // 6 soal x skala 1-5

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

export default function PrePostResults() {
  const router = useRouter();
  const { user } = useAuth();
  const [pretest, setPretest] = useState<QuizDoc | null>(null);
  const [attempts, setAttempts] = useState<StageAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [quizRes, stageRes] = await Promise.all([
          fetch(`/api/quiz?userId=${encodeURIComponent(user.uid)}`, { signal: controller.signal }),
          fetch(`/api/stage?userId=${encodeURIComponent(user.uid)}`, { signal: controller.signal }),
        ]);

        if (!quizRes.ok) {
          const data = await quizRes.json().catch(() => ({}));
          throw new Error(data.message || 'Gagal memuat data pretest');
        }
        if (!stageRes.ok) {
          const data = await stageRes.json().catch(() => ({}));
          throw new Error(data.message || 'Gagal memuat data posttest');
        }

        const quizData = (await quizRes.json()) as QuizResponse;
        const stageData = (await stageRes.json()) as StageResponse;

        setPretest(quizData.results?.[0] ?? null);
        setAttempts(stageData.attempts || []);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('[PrePost] fetch error:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [user?.uid]);

  const postByStage = useMemo(() => {
    const map = new Map<WeightedStageId, StageAttempt>();
    attempts.forEach((attempt) => {
      if (!weightedStageOrder.includes(attempt.stage as WeightedStageId)) return;
      const current = map.get(attempt.stage as WeightedStageId);
      if (!current) {
        map.set(attempt.stage as WeightedStageId, attempt);
        return;
      }
      const currentDate = new Date(current.createdAt).getTime();
      const newDate = new Date(attempt.createdAt).getTime();
      if (newDate > currentDate) {
        map.set(attempt.stage as WeightedStageId, attempt);
      }
    });
    return map;
  }, [attempts]);

  const rows = weightedStageOrder.map((stage) => {
    const preScore = pretest?.scores?.[stage] ?? 0;
    const prePercent = Math.round((preScore / QUIZ_MAX_PER_STAGE) * 100);
    const preCategory = scoreToCategory(prePercent);

    const postAttempt = postByStage.get(stage);
    const maxPost = weightedAssessment[stage].length * 40;
    const postScore = postAttempt?.score ?? 0;
    const postPercent = Math.round((postScore / maxPost) * 100);
    const postCategory = scoreToCategory(postPercent);

    const improvement = postPercent - prePercent;

    return {
      stage,
      label: STAGE_LABELS[stage],
      preScore,
      prePercent,
      preCategory,
      preDate: pretest?.createdAt,
      postScore,
      postPercent,
      postCategory,
      postDate: postAttempt?.createdAt,
      improvement,
      passed: postAttempt?.passed ?? false,
    };
  });

const latestPostTimestamp = rows.reduce(
  (latest, row) =>
    !row.postDate ? latest : Math.max(latest, new Date(row.postDate).getTime()),
  0,
);
const latestPostDate =
  latestPostTimestamp > 0 ? new Date(latestPostTimestamp).toISOString() : undefined;

  const overall = useMemo(() => {
    const filledRows = rows.filter((row) => row.postPercent > 0 || row.prePercent > 0);
    const averagePre =
      filledRows.length > 0
        ? Math.round(filledRows.reduce((acc, row) => acc + row.prePercent, 0) / filledRows.length)
        : 0;
    const averagePost =
      filledRows.length > 0
        ? Math.round(filledRows.reduce((acc, row) => acc + row.postPercent, 0) / filledRows.length)
        : 0;

    const improvement = averagePost - averagePre;

    return {
      averagePre,
      averagePost,
      improvement,
      preCategory: scoreToCategory(averagePre),
      postCategory: scoreToCategory(averagePost),
    };
  }, [rows]);

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
            Silakan login terlebih dahulu untuk melihat perbandingan pretest dan posttest.
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
            <GameBadge className="bg-blue-400/90 text-indigo-900 border-white">
              Pretest & Posttest
            </GameBadge>
            <h1 className="text-3xl font-extrabold drop-shadow mt-2">
              Perbandingan CAAS I dan CAAS II
            </h1>
            <p className="text-white/85 font-semibold max-w-3xl">
              Lihat perkembangan adaptabilitas karier dari hasil pretest (CAAS 1) menuju posttest yang
              diwakili oleh assessment setiap stage di Journey. Persentase dihitung pada rentang 0-100%.
            </p>
          </div>
          <GameButton onClick={() => router.push('/results')} className="from-gray-400 to-gray-600">
            Menu Hasil
          </GameButton>
        </div>

        {loading ? (
          <GameCard className="bg-white/80 text-center text-gray-700 font-semibold">
            Memuat data pretest dan posttest...
          </GameCard>
        ) : error ? (
          <GameCard className="bg-red-100 border-2 border-red-300 text-red-700 font-semibold">
            {error}
          </GameCard>
        ) : (
          <>
            <GameCard className="bg-gradient-to-br from-white/90 to-white/60 text-gray-800 border-4 border-white/70 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold drop-shadow-sm">Ringkasan Umum</h2>
                  <p className="text-sm font-semibold text-gray-600">
                    Data terakhir pretest: {formatDate(pretest?.createdAt)} • Data terakhir posttest:{' '}
                    {formatDate(latestPostDate)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/70 rounded-xl border border-emerald-100 p-3 text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Rata-rata Pretest</p>
                    <p className="text-3xl font-black text-blue-500">{overall.averagePre}%</p>
                    <p className="text-xs text-gray-500">{overall.preCategory}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl border border-emerald-100 p-3 text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Rata-rata Posttest</p>
                    <p className="text-3xl font-black text-emerald-600">{overall.averagePost}%</p>
                    <p className="text-xs text-gray-500">{overall.postCategory}</p>
                  </div>
                  <div className="bg-white/70 rounded-xl border border-emerald-100 p-3 text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Kenaikan</p>
                    <p className={`text-3xl font-black ${overall.improvement >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {overall.improvement >= 0 ? '+' : ''}
                      {overall.improvement}%
                    </p>
                    <p className="text-xs text-gray-500">Posttest - Pretest</p>
                  </div>
                </div>
              </div>
            </GameCard>

            <GameCard className="bg-gradient-to-br from-white/90 to-white/60 text-gray-800 border-4 border-white/70 space-y-4">
              <h2 className="text-xl font-extrabold drop-shadow-sm">Rincian Per Dimensi</h2>
              <div className="overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-emerald-600/90 text-white">
                      <th className="px-4 py-3 font-bold">Dimensi</th>
                      <th className="px-4 py-3 font-bold text-center">Pretest (CAAS I)</th>
                      <th className="px-4 py-3 font-bold text-center">Posttest (Stage)</th>
                      <th className="px-4 py-3 font-bold text-center">Kenaikan</th>
                      <th className="px-4 py-3 font-bold text-center">Status Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.stage} className="odd:bg-white/70 even:bg-white/50 border-b border-white/60">
                        <td className="px-4 py-3 font-bold">{row.label}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="font-semibold text-blue-600">{row.prePercent}%</div>
                          <div className="text-xs text-gray-500">{row.preCategory}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.postPercent > 0 ? (
                            <>
                              <div className="font-semibold text-emerald-600">{row.postPercent}%</div>
                              <div className="text-xs text-gray-500">
                                {row.postCategory} • {row.passed ? 'Lolos ✅' : 'Belum Lolos ⚠️'}
                              </div>
                            </>
                          ) : (
                            <div className="text-xs font-semibold text-gray-500">Belum ada posttest</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`font-bold ${
                              row.improvement > 0
                                ? 'text-emerald-600'
                                : row.improvement < 0
                                ? 'text-red-500'
                                : 'text-gray-600'
                            }`}
                          >
                            {row.improvement >= 0 ? '+' : ''}
                            {row.improvement}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <GameButton
                            onClick={() => router.push(`/quiz/${row.stage}?mode=assessment`)}
                            className="from-yellow-400 to-orange-500 text-xs px-3 py-2"
                          >
                            Lihat Assessment
                          </GameButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GameCard>
          </>
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


