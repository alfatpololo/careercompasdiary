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

type StageAttempt = {
  id: string;
  stage: string;
  score: number;
  passed: boolean;
  createdAt: string;
  answers?: number[];
};

type StageResponse = {
  attempts: StageAttempt[];
  latest: Record<string, { score: number; passed: boolean; createdAt: string }>;
};

const stageLabels: Record<WeightedStageId, string> = {
  concern: 'Concern',
  control: 'Control',
  curiosity: 'Curiosity',
  confidence: 'Confidence',
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

export default function AdaptabilityResults() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<StageAttempt[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const controller = new AbortController();

    const loadAttempts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stage?userId=${encodeURIComponent(user.uid)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Gagal memuat data stage');
        }
        const data = (await res.json()) as StageResponse;
        setAttempts(data.attempts || []);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('[Results] Stage fetch error:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga');
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
    return () => controller.abort();
  }, [user?.uid]);

  const stageSummaries = useMemo(() => {
    return weightedStageOrder.map((stage) => {
      const questions = weightedAssessment[stage];
      const maxScore = questions.length * 40;
      const latestAttempt = attempts.find((a) => a.stage === stage);

      if (!latestAttempt) {
        return {
          stage,
          hasData: false,
          maxScore,
        };
      }

      const totalScore = latestAttempt.score ?? 0;
      const percent = Math.round((totalScore / maxScore) * 100);

      const details = questions.map((question, idx) => {
        const selectedIndex = latestAttempt.answers?.[idx];
        const selectedOption =
          typeof selectedIndex === 'number' ? question.options[selectedIndex] : undefined;
        return {
          no: idx + 1,
          prompt: question.q,
          answerText: selectedOption?.text ?? 'Belum dijawab',
          percent: selectedOption?.score ?? 0,
        };
      });

      return {
        stage,
        hasData: true,
        maxScore,
        totalScore,
        percent,
        category: scoreToCategory(percent),
        passed: latestAttempt.passed,
        attemptedAt: latestAttempt.createdAt,
        details,
      };
    });
  }, [attempts]);

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
            Silakan login terlebih dahulu untuk melihat hasil adaptabilitas kariermu.
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
            <GameBadge className="bg-yellow-400/90 text-emerald-800 border-white">
              Hasil Dimensi Adaptabilitas Karier
            </GameBadge>
            <h1 className="text-3xl font-extrabold drop-shadow mt-2">
              Perolehan Skor Concern hingga Confidence
            </h1>
            <p className="text-white/85 font-semibold max-w-3xl">
              Rincian skor per soal dan kategori kelulusan untuk setiap assessment. Gunakan informasi ini
              untuk memantau kekuatan dan aspek yang perlu diperkuat.
            </p>
          </div>
          <GameButton onClick={() => router.push('/results')} className="from-gray-400 to-gray-600">
            Menu Hasil
          </GameButton>
        </div>

        {loading ? (
          <GameCard className="bg-white/80 text-center text-gray-700 font-semibold">
            Memuat data hasil adaptabilitas...
          </GameCard>
        ) : error ? (
          <GameCard className="bg-red-100 border-2 border-red-300 text-red-700 font-semibold">
            {error}
          </GameCard>
        ) : (
          stageSummaries.map((summary) => (
            <GameCard
              key={summary.stage}
              className="bg-gradient-to-br from-white/90 to-white/60 text-gray-800 border-4 border-white/70 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <GameBadge className="bg-emerald-500/80 border-white text-white">
                    {stageLabels[summary.stage]}
                  </GameBadge>
                  <h2 className="text-2xl font-extrabold drop-shadow-sm">
                    Assessment {stageLabels[summary.stage]}
                  </h2>
                  <p className="text-sm font-semibold text-gray-600">
                    Terakhir diakses: {formatDate(summary.hasData ? summary.attemptedAt : undefined)}
                  </p>
                </div>
                {summary.hasData ? (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-600">Total Nilai</p>
                    <p className="text-3xl font-black text-emerald-600">
                      {summary.totalScore ?? 0} / {summary.maxScore}
                    </p>
                    <p className="text-sm font-semibold text-gray-600">
                      {summary.percent}% • {summary.category} • {summary.passed ? 'Lolos ✅' : 'Belum Lolos ⚠️'}
                    </p>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-600">Status</p>
                    <p className="text-xl font-bold text-orange-500">Belum ada data</p>
                    <GameButton
                      onClick={() => router.push(`/quiz/${summary.stage}?mode=assessment`)}
                      className="mt-2 from-green-500 to-emerald-600"
                    >
                      Mulai Assessment
                    </GameButton>
                  </div>
                )}
              </div>

              {summary.hasData && (
                <div className="bg-white/70 rounded-2xl border-2 border-white/60 p-4 space-y-3">
                  <h3 className="text-lg font-bold text-gray-700">Rincian Per Soal</h3>
                  <div className="space-y-3">
                    {summary.details?.map((detail) => (
                      <div
                        key={detail.no}
                        className="bg-white/70 rounded-xl border border-emerald-100 p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-emerald-700">
                            Soal {detail.no}
                          </span>
                          <span className="text-sm font-semibold text-gray-600">
                            {detail.percent}%
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">{detail.prompt}</p>
                        <p className="text-sm text-gray-600">
                          Jawaban kamu: <span className="font-semibold">{detail.answerText}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GameCard>
          ))
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


