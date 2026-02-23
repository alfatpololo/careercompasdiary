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
} from '../../../lib/stageContent';

type QuizDoc = {
  id: string;
  scores?: Record<string, number>;
  total?: number;
  percent?: number;
  category?: string;
  createdAt?: string;
  isPosttest?: boolean;
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

const QUIZ_MAX_PER_STAGE = 30; // 6 soal x skala 1-5 (START quiz)
const ASSESSMENT_MAX_PER_STAGE = 240; // 6 soal x 40 poin (Assessment di Journey)

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

function PrePostResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [pretest, setPretest] = useState<QuizDoc | null>(null);
  const [attempts, setAttempts] = useState<StageAttempt[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewMode = searchParams?.get('view') as 'pretest' | 'posttest' | null;

  useEffect(() => {
    if (!user?.uid) return;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get user name
        const userName = user.displayName || user.email || 'User';
        setUserName(userName);

        console.log('[PrePost] Fetching data for user:', user.uid);
        
        const [quizRes, stageRes] = await Promise.all([
          fetch(`/api/quiz?userId=${encodeURIComponent(user.uid)}`, { signal: controller.signal }),
          fetch(`/api/stage?userId=${encodeURIComponent(user.uid)}`, { signal: controller.signal }),
        ]);

        console.log('[PrePost] Quiz response status:', quizRes.status);
        console.log('[PrePost] Stage response status:', stageRes.status);

        // Parse JSON responses with error handling
        let quizData: QuizResponse | { message?: string };
        let stageData: StageResponse | { message?: string };

        try {
          quizData = (await quizRes.json()) as QuizResponse | { message?: string };
        } catch (jsonErr) {
          console.error('[PrePost] Error parsing quiz JSON:', jsonErr);
          const text = await quizRes.text().catch(() => '');
          throw new Error(`Gagal memuat data pretest: ${text || 'Invalid JSON response'}`);
        }

        try {
          stageData = (await stageRes.json()) as StageResponse | { message?: string };
        } catch (jsonErr) {
          console.error('[PrePost] Error parsing stage JSON:', jsonErr);
          const text = await stageRes.text().catch(() => '');
          throw new Error(`Gagal memuat data posttest: ${text || 'Invalid JSON response'}`);
        }

        // Check for errors after parsing
        if (!quizRes.ok) {
          const errorMsg = (quizData as { message?: string }).message || 'Gagal memuat data pretest';
          console.error('[PrePost] Quiz API error:', errorMsg);
          throw new Error(errorMsg);
        }
        if (!stageRes.ok) {
          const errorMsg = (stageData as { message?: string }).message || 'Gagal memuat data posttest';
          console.error('[PrePost] Stage API error:', errorMsg);
          throw new Error(errorMsg);
        }

        const quizResults = (quizData as QuizResponse).results || [];
        const stageAttempts = (stageData as StageResponse).attempts || [];
        
        console.log('[PrePost] Quiz results count:', quizResults.length);
        console.log('[PrePost] Stage attempts count:', stageAttempts.length);

        // Ambil pretest (isPosttest === false atau undefined), bukan posttest
        // Pretest harus tetap sama meskipun sudah ada posttest
        const pretestResult = quizResults.find((r) => !r.isPosttest) ?? null;
        setPretest(pretestResult);
        setAttempts(Array.isArray(stageAttempts) ? stageAttempts : []);
        
        console.log('[PrePost] Data loaded successfully');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('[PrePost] Request aborted');
          return;
        }
        console.error('[PrePost] fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [user?.uid, user?.displayName, user?.email]);

  const postByStage = useMemo(() => {
    try {
      const map = new Map<WeightedStageId, StageAttempt>();
      if (!attempts || !Array.isArray(attempts) || attempts.length === 0) {
        console.log('[PrePost] No attempts data available');
        return map;
      }
      
      attempts.forEach((attempt) => {
        if (!attempt || typeof attempt !== 'object') return;
        if (!attempt.stage || typeof attempt.stage !== 'string') return;
        if (!weightedStageOrder.includes(attempt.stage as WeightedStageId)) return;
        
        const current = map.get(attempt.stage as WeightedStageId);
        if (!current) {
          map.set(attempt.stage as WeightedStageId, attempt);
          return;
        }
        
        try {
          if (!current.createdAt || !attempt.createdAt) return;
          const currentDate = new Date(current.createdAt).getTime();
          const newDate = new Date(attempt.createdAt).getTime();
          if (isNaN(currentDate) || isNaN(newDate)) return;
          
          if (newDate > currentDate) {
            map.set(attempt.stage as WeightedStageId, attempt);
          }
        } catch (e) {
          console.error('[PrePost] Error parsing date:', e, attempt);
        }
      });
      
      console.log('[PrePost] PostByStage map size:', map.size);
      return map;
    } catch (error) {
      console.error('[PrePost] Error in postByStage calculation:', error);
      return new Map<WeightedStageId, StageAttempt>();
    }
  }, [attempts]);

  const rows = useMemo(() => {
    try {
      return weightedStageOrder.map((stage) => {
        try {
          const preScore = pretest?.scores?.[stage] ?? 0;
          const prePercent = QUIZ_MAX_PER_STAGE > 0 ? Math.round((preScore / QUIZ_MAX_PER_STAGE) * 100) : 0;
          // Convert pre score (0-30) to 0-240 scale for category calculation
          const preScoreScaled = QUIZ_MAX_PER_STAGE > 0 ? Math.round((preScore / QUIZ_MAX_PER_STAGE) * 240) : 0;
          const preCategory = scoreToCategory(preScoreScaled, 240);

          const postAttempt = postByStage.get(stage);
          const maxPost = weightedAssessment[stage]?.length * 40 || 240; // 6 soal * 40 = 240
          const postScore = postAttempt?.score ?? 0;
          const postPercent = maxPost > 0 ? Math.round((postScore / maxPost) * 100) : 0;
          const postCategory = scoreToCategory(postScore, maxPost);

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
        } catch (error) {
          console.error('[PrePost] Error processing stage:', stage, error);
          return {
            stage,
            label: STAGE_LABELS[stage],
            preScore: 0,
            prePercent: 0,
            preCategory: 'Very Low' as const,
            preDate: undefined,
            postScore: 0,
            postPercent: 0,
            postCategory: 'Very Low' as const,
            postDate: undefined,
            improvement: 0,
            passed: false,
          };
        }
      });
    } catch (error) {
      console.error('[PrePost] Error calculating rows:', error);
      return [];
    }
  }, [pretest, postByStage]);

  const latestPostDate = useMemo(() => {
    try {
      if (!postByStage || postByStage.size === 0) {
        console.log('[PrePost] No postByStage data for latest date');
        return undefined;
      }
      
      const latestPostTimestamp = Array.from(postByStage.values()).reduce((latest, attempt) => {
        if (!attempt || !attempt.createdAt) return latest;
        try {
          const timestamp = new Date(attempt.createdAt).getTime();
          if (isNaN(timestamp)) return latest;
          return Math.max(latest, timestamp);
        } catch (e) {
          console.error('[PrePost] Error parsing date in latestPostDate:', e);
          return latest;
        }
      }, 0);
      
      const result = latestPostTimestamp > 0 ? new Date(latestPostTimestamp).toISOString() : undefined;
      console.log('[PrePost] Latest post date:', result);
      return result;
    } catch (error) {
      console.error('[PrePost] Error calculating latest post date:', error);
      return undefined;
    }
  }, [postByStage]);

  const overall = useMemo(() => {
    try {
      // Calculate total scores from START (pre) and all assessments (post)
      const preTotal = pretest?.scores 
        ? (pretest.scores.concern || 0) + 
          (pretest.scores.control || 0) + 
          (pretest.scores.curiosity || 0) + 
          (pretest.scores.confidence || 0)
        : 0;
      const preMaxTotal = QUIZ_MAX_PER_STAGE * 4; // 30 * 4 = 120
      const preTotalPercent = preMaxTotal > 0 ? Math.round((preTotal / preMaxTotal) * 100) : 0;
      const preTotalScaled = Math.round((preTotal / preMaxTotal) * 960); // Scale to 0-960 (4 stages * 240)
      const preCategory = scoreToCategory(Math.round((preTotalScaled / 960) * 240), 240);

      // Calculate posttest total from latest attempts for each stage
      // Convert posttest score (0-240 per stage) to pretest scale (0-30 per stage)
      // Then total will be 0-120 (same as pretest)
      const postTotal = Array.from(postByStage.values()).reduce((sum, attempt) => {
        if (!attempt || typeof attempt !== 'object') return sum;
        const score = typeof attempt?.score === 'number' && !isNaN(attempt.score) ? attempt.score : 0;
        // Convert from 0-240 scale to 0-30 scale (same as pretest)
        // score / 240 * 30 = score * 30 / 240 = score / 8
        const scaledScore = Math.round(score / 8);
        // Ensure scaled score doesn't exceed maximum per stage (30)
        const cappedScore = Math.min(scaledScore, QUIZ_MAX_PER_STAGE);
        return sum + cappedScore;
      }, 0);
      
      // Maximum is same as pretest: 30 per stage * 4 stages = 120
      const postMaxTotal = QUIZ_MAX_PER_STAGE * 4; // 30 * 4 = 120
      const postTotalPercent = postMaxTotal > 0 ? Math.round((postTotal / postMaxTotal) * 100) : 0;
      // Convert postTotal back to 0-240 scale for category calculation
      const postTotalScaled = Math.round((postTotal / postMaxTotal) * 240);
      const postCategory = scoreToCategory(postTotalScaled, 240);
      
      console.log('[PrePost] Posttest calculation:', {
        postTotal,
        postMaxTotal,
        postTotalPercent,
        postCategory,
        attemptsCount: postByStage.size,
        attempts: Array.from(postByStage.entries()).map(([stage, att]) => {
          const rawScore = att?.score || 0;
          const scaledScore = Math.round(rawScore / 8);
          return {
            stage,
            rawScore,
            scaledScore,
            maxRaw: ASSESSMENT_MAX_PER_STAGE,
            maxScaled: QUIZ_MAX_PER_STAGE
          };
        })
      });
      
      // Log pretest calculation too
      console.log('[PrePost] Pretest calculation:', {
        preTotal,
        preMaxTotal,
        preTotalPercent,
        preCategory,
        pretestScores: pretest?.scores
      });

      const improvement = postTotalPercent - preTotalPercent;

      return {
        preTotal,
        preTotalPercent,
        preMaxTotal,
        preCategory,
        postTotal,
        postTotalPercent,
        postMaxTotal,
        postCategory,
        improvement,
      };
    } catch (error) {
      console.error('[PrePost] Error calculating overall:', error);
      return {
        preTotal: 0,
        preTotalPercent: 0,
        preMaxTotal: QUIZ_MAX_PER_STAGE * 4,
        preCategory: 'Very Low' as const,
        postTotal: 0,
        postTotalPercent: 0,
        postMaxTotal: ASSESSMENT_MAX_PER_STAGE * 4,
        postCategory: 'Very Low' as const,
        improvement: 0,
      };
    }
  }, [pretest, postByStage]);

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
              {viewMode === 'pretest' ? 'Pretest' : viewMode === 'posttest' ? 'Posttest' : 'Pretest & Posttest'}
            </GameBadge>
            <h1 className="text-3xl font-extrabold drop-shadow mt-2">
              {viewMode === 'pretest' 
                ? 'Hasil Pretest Adaptabilitas Karier (START)'
                : viewMode === 'posttest'
                ? 'Hasil Posttest Adaptabilitas Karier'
                : 'Perbandingan Pretest & Posttest Adaptabilitas Karier'}
            </h1>
            <p className="text-white/85 font-semibold max-w-3xl">
              {viewMode === 'pretest'
                ? 'Hasil test adaptabilitas karir di START (pretest).'
                : viewMode === 'posttest'
                ? 'Hasil adaptabilitas karir terakhir di stage journey (posttest).'
                : 'Perbandingan hasil test adaptabilitas karir di START (pretest) dengan hasil adaptabilitas karir terakhir di stage journey (posttest).'}
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
            Memuat data pretest dan posttest...
          </GameCard>
        ) : error ? (
          <GameCard className="bg-red-100 border-2 border-red-300 text-red-700 font-semibold">
            {error}
          </GameCard>
        ) : (
          <>
            <GameCard className="bg-gradient-to-br from-white/90 to-white/60 !text-gray-800 border-4 border-white/70 space-y-4">
              <h2 className="text-xl font-extrabold drop-shadow-sm !text-gray-800 mb-4">Hasil Pretest & Posttest</h2>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-emerald-600/90 text-white">
                      <th className="px-4 py-3 font-bold text-left">Nama</th>
                      <th className="px-4 py-3 font-bold text-center">Jenis Test</th>
                      <th className="px-4 py-3 font-bold text-center">Skor</th>
                      <th className="px-4 py-3 font-bold text-center">Persentase</th>
                      <th className="px-4 py-3 font-bold text-center">Kategori</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Pretest Row - Show if viewMode is null (both) or 'pretest' */}
                    {(viewMode === null || viewMode === 'pretest') && (
                      <tr className="odd:bg-white/70 even:bg-white/50 border-b border-white/60">
                        <td className="px-4 py-3 font-semibold !text-gray-800">{userName}</td>
                        <td className="px-4 py-3 text-center font-semibold !text-blue-700">Pretest (START)</td>
                        <td className="px-4 py-3 text-center font-bold !text-gray-800">
                          {overall.preTotal} / {overall.preMaxTotal}
                        </td>
                        <td className="px-4 py-3 text-center font-bold !text-blue-700">{overall.preTotalPercent}%</td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 !text-blue-700">
                            {overall.preCategory}
                          </span>
                        </td>
                      </tr>
                    )}
                    {/* Posttest Row - Show if viewMode is null (both) or 'posttest' */}
                    {(viewMode === null || viewMode === 'posttest') && (
                      <tr className="odd:bg-white/70 even:bg-white/50 border-b border-white/60">
                        <td className="px-4 py-3 font-semibold !text-gray-800">{userName}</td>
                        <td className="px-4 py-3 text-center font-semibold !text-emerald-700">Posttest (Adaptabilitas Karier)</td>
                        <td className="px-4 py-3 text-center font-bold !text-gray-800">
                          {overall.postTotal > 0 ? `${overall.postTotal} / ${overall.postMaxTotal}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-center font-bold !text-emerald-700">
                          {overall.postTotalPercent > 0 ? `${overall.postTotalPercent}%` : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {overall.postTotal > 0 ? (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 !text-emerald-700">
                              {overall.postCategory}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold !text-gray-500">Belum ada data</span>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {overall.postTotal > 0 && (viewMode === null || viewMode === 'posttest') && (
                <div className="mt-4 pt-4 border-t-2 border-white/60">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold !text-gray-700">Kenaikan:</span>
                    <span className={`text-2xl font-black ${overall.improvement >= 0 ? '!text-emerald-700' : '!text-red-600'}`}>
                      {overall.improvement >= 0 ? '+' : ''}
                      {overall.improvement}%
                    </span>
                  </div>
                  <p className="text-xs !text-gray-600 mt-1">
                    Data pretest: {formatDate(pretest?.createdAt)} • Data posttest: {formatDate(latestPostDate)}
                  </p>
                </div>
              )}
              {(viewMode === 'pretest' || viewMode === 'posttest') && (
                <div className="mt-4 pt-4 border-t-2 border-white/60">
                  <p className="text-xs !text-gray-600">
                    {viewMode === 'pretest' 
                      ? `Data pretest: ${formatDate(pretest?.createdAt)}`
                      : `Data posttest: ${formatDate(latestPostDate)}`}
                  </p>
                </div>
              )}
            </GameCard>
          </>
        )}

        <div className="flex justify-between flex-wrap gap-3">
          <GameButton onClick={() => router.push('/')} className="from-blue-500 to-blue-600">
            ← Home
          </GameButton>
          <div className="flex gap-2 flex-wrap">
            {(viewMode === null || viewMode === 'posttest') && overall.postTotal > 0 && (
              <GameButton onClick={() => router.push('/leaderboard')} className="from-amber-500 to-amber-600">
                🏆 Peringkat
              </GameButton>
            )}
            <GameButton onClick={() => router.push('/results')} className="from-gray-400 to-gray-600">
              Kembali ke Hasil
            </GameButton>
            <GameButton onClick={() => router.push('/journey')} className="from-blue-500 to-indigo-600">
              Lihat Journey Map
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrePostResults() {
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
      <PrePostResultsContent />
    </Suspense>
  );
}


