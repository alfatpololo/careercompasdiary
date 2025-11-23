'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton, LoadingSpinner } from '../../../components/GameUI';
import {
  weightedAssessment,
  weightedStageOrder,
  type WeightedStageId,
  scoreToCategory,
  getCategoryInfo,
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

function AdaptabilityResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<StageAttempt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const selectedStage = searchParams?.get('stage') as WeightedStageId | null;

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
    let stagesToShow = weightedStageOrder;
    
    // Filter to show only selected stage if query parameter is present
    if (selectedStage && weightedStageOrder.includes(selectedStage)) {
      stagesToShow = [selectedStage];
    }
    
    return stagesToShow.map((stage) => {
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
        category: scoreToCategory(totalScore, maxScore),
        passed: latestAttempt.passed,
        attemptedAt: latestAttempt.createdAt,
        details,
      };
    });
  }, [attempts, selectedStage]);

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

  if (loading) {
    return (
      <div
        className="min-h-screen py-12 px-4 flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Mulai.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <LoadingSpinner size="lg" text="Memuat hasil adaptabilitas..." fullScreen={false} />
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
              {selectedStage 
                ? `Hasil Assessment ${stageLabels[selectedStage]}`
                : 'Perolehan Skor Concern hingga Confidence'}
            </h1>
            <p className="text-white/85 font-semibold max-w-3xl">
              {selectedStage
                ? `Rincian skor per soal dan kategori kelulusan untuk assessment ${stageLabels[selectedStage]}.`
                : 'Rincian skor per soal dan kategori kelulusan untuk setiap assessment. Gunakan informasi ini untuk memantau kekuatan dan aspek yang perlu diperkuat.'}
            </p>
          </div>
          <div className="flex gap-2">
            <GameButton onClick={() => router.push('/')} className="from-blue-500 to-blue-600">
              ← Home
            </GameButton>
            <GameButton onClick={() => router.push('/results')} className="from-gray-400 to-gray-600">
              Menu Hasil
            </GameButton>
          </div>
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
              className="bg-gradient-to-br from-white/90 to-white/60 !text-gray-800 border-4 border-white/70 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold drop-shadow-sm !text-gray-800">
                    Assessment {stageLabels[summary.stage]}
                  </h2>
                  <p className="text-sm font-semibold !text-gray-600">
                    Terakhir diakses: {formatDate(summary.hasData ? summary.attemptedAt : undefined)}
                  </p>
                </div>
                {summary.hasData ? (
                  <div className="text-right">
                    <p className="text-sm font-semibold !text-gray-700">Total Nilai</p>
                    <p className="text-3xl font-black !text-emerald-700">
                      {summary.totalScore ?? 0} / {summary.maxScore}
                    </p>
                    <p className="text-sm font-semibold !text-gray-700">
                      {summary.percent}% • {summary.category}
                    </p>
                    {summary.category && (() => {
                      const categoryInfo = getCategoryInfo(summary.category);
                      return (
                        <div className={`mt-2 p-2 rounded-lg border ${categoryInfo.color}`}>
                          <p className="text-xs font-semibold !text-gray-800">{categoryInfo.action}</p>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="text-sm font-semibold !text-gray-700">Status</p>
                    <p className="text-xl font-bold !text-orange-600">Belum ada data</p>
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
                  <h3 className="text-lg font-bold !text-gray-700">Rincian Per Soal</h3>
                  <div className="space-y-3">
                    {summary.details?.map((detail) => (
                      <div
                        key={detail.no}
                        className="bg-white/70 rounded-xl border border-emerald-100 p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold !text-emerald-700">
                            Soal {detail.no}
                          </span>
                        </div>
                        <p className="text-sm font-semibold !text-gray-800">{detail.prompt}</p>
                        <p className="text-sm !text-gray-700">
                          Jawaban kamu: <span className="font-semibold !text-gray-900">{detail.answerText}</span>
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

export default function AdaptabilityResults() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Mulai.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <LoadingSpinner size="lg" text="Memuat..." fullScreen={false} />
      </div>
    }>
      <AdaptabilityResultsContent />
    </Suspense>
  );
}


