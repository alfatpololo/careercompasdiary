'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { GameCard, GameButton, LoadingSpinner } from '../../components/GameUI';
import { weightedStageOrder, getCategoryInfo } from '../../lib/stageContent';

type EvaluationDoc = {
  id: string;
  type: string;
  stage?: string;
  answers?: number[];
  createdAt?: string;
  evaluatorRole?: string;
  userId?: string;
};

type QuizDoc = {
  id: string;
  scores?: Record<string, number>;
  total?: number;
  percent?: number;
  category?: string;
  isPosttest?: boolean;
  createdAt?: string;
};

type StageAttempt = {
  id: string;
  stage: string;
  score: number;
  passed: boolean;
  createdAt: string;
  answers?: number[];
};

type UserDoc = {
  id: string;
  name?: string;
  email?: string;
  role?: 'guru' | 'siswa';
  username?: string;
};

const STAGE_LABELS: Record<string, string> = {
  start: 'START (Pertemuan Pertama)',
  concern: 'CONCERN (Pertemuan Kedua)',
  control: 'CONTROL (Pertemuan Ketiga)',
  curiosity: 'CURIOSITY (Pertemuan Keempat)',
  confidence: 'CONFIDENCE (Pertemuan Kelima)'
};

const STAGE_COLORS: Record<string, string> = {
  concern: 'bg-sky-500',
  control: 'bg-emerald-500',
  curiosity: 'bg-purple-500',
  confidence: 'bg-orange-500',
};

const calculateScore = (answers: number[]): { total: number; interpretation: string; level: string } => {
  const total = answers.reduce((sum, ans) => sum + ans, 0);
  let interpretation = '';
  let level = '';
  
  if (total >= 12 && total <= 15) {
    interpretation = 'Sudah baik dan mandiri';
    level = 'tinggi';
  } else if (total >= 8 && total <= 11) {
    interpretation = 'Perlu penguatan';
    level = 'sedang';
  } else if (total >= 5 && total <= 7) {
    interpretation = 'Perlu intervensi atau pendampingan lebih intens';
    level = 'rendah';
  } else {
    interpretation = 'Skor di luar rentang normal';
    level = 'tidak valid';
  }
  
  return { total, interpretation, level };
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export default function HasilPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'guru' | 'siswa' | null>(null);
  const [selectedTab, setSelectedTab] = useState<'guru' | 'siswa'>('guru');
  const [guruEvaluations, setGuruEvaluations] = useState<EvaluationDoc[]>([]);
  const [siswaEvaluations, setSiswaEvaluations] = useState<EvaluationDoc[]>([]);
  const [siswaQuizzes, setSiswaQuizzes] = useState<QuizDoc[]>([]);
  const [siswaStages, setSiswaStages] = useState<StageAttempt[]>([]);
  const [users, setUsers] = useState<Record<string, UserDoc>>({});
  const [loading, setLoading] = useState(true);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      router.push('/login');
      return;
    }

    // Check user role
    const checkRole = async () => {
      try {
        const userRes = await fetch(`/api/users?userId=${encodeURIComponent(user.uid)}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          const role = userData.data?.role || null;
          setUserRole(role);
          
          // If siswa, redirect to results page (original results hub)
          if (role === 'siswa') {
            router.push('/results');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking role:', error);
      } finally {
        setCheckingRole(false);
      }
    };

    checkRole();
  }, [user, router]);

  useEffect(() => {
    // Only load data if user is guru
    if (checkingRole || userRole !== 'guru') {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // Load all evaluations
        const allRes = await fetch('/api/evaluation');
        if (allRes.ok) {
          const allData = await allRes.json();
          const allEvaluations = allData.evaluations || [];
          
          // Separate guru and siswa evaluations
          const guruEvals = allEvaluations.filter(
            (evaluation: EvaluationDoc) => evaluation.type === 'guru-process' || evaluation.type === 'guru-result'
          );
          const siswaEvals = allEvaluations.filter(
            (evaluation: EvaluationDoc) => 
              (evaluation.type === 'process' || evaluation.type === 'result') && 
              (!evaluation.evaluatorRole || evaluation.evaluatorRole !== 'guru')
          );
          
          setGuruEvaluations(guruEvals);
          setSiswaEvaluations(siswaEvals);
        }

        // Load all quizzes (pretest and posttest)
        const quizzesRes = await fetch('/api/quiz');
        if (quizzesRes.ok) {
          const quizzesData = await quizzesRes.json();
          setSiswaQuizzes(quizzesData.results || []);
        }

        // Load all stage attempts
        const stagesRes = await fetch('/api/stage');
        if (stagesRes.ok) {
          const stagesData = await stagesRes.json();
          setSiswaStages(stagesData.attempts || []);
        }

        // Load all users for display
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData.success && usersData.data) {
            const usersMap: Record<string, UserDoc> = {};
            usersData.data.forEach((u: UserDoc) => {
              usersMap[u.id] = u;
            });
            setUsers(usersMap);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, router, checkingRole, userRole]);

  const groupEvaluationsByStage = (evaluations: EvaluationDoc[]) => {
    const grouped: Record<string, { process?: EvaluationDoc; result?: EvaluationDoc }> = {};
    
    evaluations.forEach((evaluation) => {
      const stage = evaluation.stage || 'unknown';
      if (!grouped[stage]) {
        grouped[stage] = {};
      }
      
      if (evaluation.type === 'guru-process' || evaluation.type === 'process') {
        grouped[stage].process = evaluation;
      } else if (evaluation.type === 'guru-result' || evaluation.type === 'result') {
        grouped[stage].result = evaluation;
      }
    });
    
    return grouped;
  };

  const groupQuizzesByUser = (quizzes: QuizDoc[]) => {
    const grouped: Record<string, { pretest?: QuizDoc; posttest?: QuizDoc }> = {};
    
    quizzes.forEach((quiz) => {
      const userId = (quiz as { userId?: string }).userId || 'unknown';
      if (!grouped[userId]) {
        grouped[userId] = {};
      }
      
      // Get the latest pretest and posttest for each user
      if (quiz.isPosttest) {
        if (!grouped[userId].posttest || 
            (quiz.createdAt && grouped[userId].posttest?.createdAt && 
             new Date(quiz.createdAt) > new Date(grouped[userId].posttest.createdAt))) {
          grouped[userId].posttest = quiz;
        }
      } else {
        if (!grouped[userId].pretest || 
            (quiz.createdAt && grouped[userId].pretest?.createdAt && 
             new Date(quiz.createdAt) > new Date(grouped[userId].pretest.createdAt))) {
          grouped[userId].pretest = quiz;
        }
      }
    });
    
    return grouped;
  };

  const groupStagesByUser = (stages: StageAttempt[]) => {
    const grouped: Record<string, Record<string, StageAttempt>> = {};
    
    stages.forEach((stage) => {
      const userId = (stage as { userId?: string }).userId || 'unknown';
      if (!grouped[userId]) {
        grouped[userId] = {};
      }
      // Keep only the latest attempt for each stage
      if (!grouped[userId][stage.stage] || 
          (stage.createdAt && grouped[userId][stage.stage]?.createdAt && 
           new Date(stage.createdAt) > new Date(grouped[userId][stage.stage].createdAt))) {
        grouped[userId][stage.stage] = stage;
      }
    });
    
    return grouped;
  };

  const guruGrouped = groupEvaluationsByStage(guruEvaluations);
  const siswaGrouped = groupEvaluationsByStage(siswaEvaluations);
  const quizzesGrouped = groupQuizzesByUser(siswaQuizzes);
  const stagesGrouped = groupStagesByUser(siswaStages);

  if (checkingRole || userRole === 'siswa') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <LoadingSpinner size="lg" text="Memuat..." fullScreen={false} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <LoadingSpinner size="lg" text="Memuat hasil..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{
      backgroundImage: 'url(/Background_Mulai.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="max-w-6xl mx-auto mt-16">
        <GameCard>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-extrabold text-white drop-shadow">Hasil Evaluasi & Test</h2>
              <GameButton onClick={() => router.push('/')} className="from-gray-400 to-gray-600">
                ← Kembali ke Home
              </GameButton>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedTab('guru')}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedTab === 'guru'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/20 text-white/70 hover:bg-white/30'
                }`}
              >
                Hasil Guru BK
              </button>
              <button
                onClick={() => setSelectedTab('siswa')}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedTab === 'siswa'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-white/20 text-white/70 hover:bg-white/30'
                }`}
              >
                Hasil Siswa
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 max-h-[70vh] overflow-auto pr-2">
            {selectedTab === 'guru' ? (
              Object.keys(guruGrouped).length > 0 ? (
                Object.entries(guruGrouped).map(([stage, evals]) => (
                  <div key={stage} className="bg-white/10 rounded-lg p-4 border-2 border-white/30">
                    <h3 className="text-xl font-bold text-white mb-4">
                      {STAGE_LABELS[stage] || stage.toUpperCase()}
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Evaluasi Proses */}
                      {evals.process && (
                        <div className="bg-white/10 rounded p-3">
                          <h4 className="font-bold text-white mb-2">Evaluasi Proses</h4>
                          {evals.process.answers && evals.process.answers.length > 0 && (
                            <>
                              {(() => {
                                const score = calculateScore(evals.process.answers);
                                return (
                                  <div className="text-white text-sm space-y-1">
                                    <p><strong>Total Skor:</strong> {score.total}</p>
                                    <p><strong>Interpretasi:</strong> {score.interpretation} ({score.level})</p>
                                    <p><strong>Tanggal:</strong> {formatDate(evals.process.createdAt)}</p>
                                  </div>
                                );
                              })()}
                            </>
                          )}
                        </div>
                      )}

                      {/* Evaluasi Hasil */}
                      {evals.result && (
                        <div className="bg-white/10 rounded p-3">
                          <h4 className="font-bold text-white mb-2">Evaluasi Hasil</h4>
                          {evals.result.answers && evals.result.answers.length > 0 && (
                            <>
                              {(() => {
                                const score = calculateScore(evals.result.answers);
                                return (
                                  <div className="text-white text-sm space-y-1">
                                    <p><strong>Total Skor:</strong> {score.total}</p>
                                    <p><strong>Interpretasi:</strong> {score.interpretation} ({score.level})</p>
                                    <p><strong>Tanggal:</strong> {formatDate(evals.result.createdAt)}</p>
                                  </div>
                                );
                              })()}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/70">
                  <p>Belum ada hasil evaluasi guru</p>
                </div>
              )
            ) : (
              <div className="space-y-6">
                {/* Pretest & Posttest */}
                <div className="bg-white/10 rounded-lg p-4 border-2 border-white/30">
                  <h3 className="text-xl font-bold text-white mb-4">Pretest & Posttest</h3>
                  {Object.keys(quizzesGrouped).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(quizzesGrouped).map(([userId, quizzes]) => {
                        const user = users[userId];
                        return (
                          <div key={userId} className="bg-white/10 rounded p-3">
                            <h4 className="font-bold text-white mb-2">
                              {user?.name || user?.username || user?.email || 'Siswa'}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                              {quizzes.pretest && (
                                <div className="bg-white/10 rounded p-2">
                                  <h5 className="font-bold text-white text-sm mb-1">Pretest</h5>
                                  <div className="text-white text-xs space-y-1">
                                    <p><strong>Total:</strong> {quizzes.pretest.total || 0}</p>
                                    <p><strong>Persentase:</strong> {quizzes.pretest.percent || 0}%</p>
                                    {quizzes.pretest.category && (() => {
                                      try {
                                        // Map Indonesian category to English ScoreCategory
                                        const categoryMap: Record<string, import('../../lib/stageContent').ScoreCategory> = {
                                          'Sangat Tinggi': 'Very High',
                                          'Tinggi': 'High',
                                          'Sedang': 'Medium',
                                          'Rendah': 'Low',
                                          'Sangat Rendah': 'Very Low',
                                          'Very High': 'Very High',
                                          'High': 'High',
                                          'Medium': 'Medium',
                                          'Low': 'Low',
                                          'Very Low': 'Very Low'
                                        };
                                        const englishCategory = categoryMap[quizzes.pretest.category] || quizzes.pretest.category as import('../../lib/stageContent').ScoreCategory;
                                        const categoryInfo = getCategoryInfo(englishCategory);
                                        return <p><strong>Kategori:</strong> {categoryInfo?.label || quizzes.pretest.category}</p>;
                                      } catch {
                                        return <p><strong>Kategori:</strong> {quizzes.pretest.category}</p>;
                                      }
                                    })()}
                                    <p><strong>Tanggal:</strong> {formatDate(quizzes.pretest.createdAt)}</p>
                                  </div>
                                </div>
                              )}
                              {quizzes.posttest && (
                                <div className="bg-white/10 rounded p-2">
                                  <h5 className="font-bold text-white text-sm mb-1">Posttest</h5>
                                  <div className="text-white text-xs space-y-1">
                                    <p><strong>Total:</strong> {quizzes.posttest.total || 0}</p>
                                    <p><strong>Persentase:</strong> {quizzes.posttest.percent || 0}%</p>
                                    {quizzes.posttest.category && (() => {
                                      try {
                                        // Map Indonesian category to English ScoreCategory
                                        const categoryMap: Record<string, import('../../lib/stageContent').ScoreCategory> = {
                                          'Sangat Tinggi': 'Very High',
                                          'Tinggi': 'High',
                                          'Sedang': 'Medium',
                                          'Rendah': 'Low',
                                          'Sangat Rendah': 'Very Low',
                                          'Very High': 'Very High',
                                          'High': 'High',
                                          'Medium': 'Medium',
                                          'Low': 'Low',
                                          'Very Low': 'Very Low'
                                        };
                                        const englishCategory = categoryMap[quizzes.posttest.category] || quizzes.posttest.category as import('../../lib/stageContent').ScoreCategory;
                                        const categoryInfo = getCategoryInfo(englishCategory);
                                        return <p><strong>Kategori:</strong> {categoryInfo?.label || quizzes.posttest.category}</p>;
                                      } catch {
                                        return <p><strong>Kategori:</strong> {quizzes.posttest.category}</p>;
                                      }
                                    })()}
                                    <p><strong>Tanggal:</strong> {formatDate(quizzes.posttest.createdAt)}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-white/70 text-sm">
                      <p>Belum ada hasil pretest/posttest</p>
                    </div>
                  )}
                </div>

                {/* Stage Attempts */}
                <div className="bg-white/10 rounded-lg p-4 border-2 border-white/30">
                  <h3 className="text-xl font-bold text-white mb-4">Hasil Stage (Assessment)</h3>
                  {Object.keys(stagesGrouped).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(stagesGrouped).map(([userId, stages]) => {
                        const user = users[userId];
                        return (
                          <div key={userId} className="bg-white/10 rounded p-3">
                            <h4 className="font-bold text-white mb-2">
                              {user?.name || user?.username || user?.email || 'Siswa'}
                            </h4>
                            <div className="grid md:grid-cols-2 gap-3">
                              {weightedStageOrder.map((stage) => {
                                const attempt = stages[stage];
                                if (!attempt) return null;
                                return (
                                  <div key={stage} className={`${STAGE_COLORS[stage] || 'bg-gray-500'} rounded p-2`}>
                                    <h5 className="font-bold text-white text-sm mb-1">{STAGE_LABELS[stage] || stage}</h5>
                                    <div className="text-white text-xs space-y-1">
                                      <p><strong>Score:</strong> {attempt.score}</p>
                                      <p><strong>Status:</strong> {attempt.passed ? 'LULUS ✓' : 'BELUM LULUS ✗'}</p>
                                      <p><strong>Tanggal:</strong> {formatDate(attempt.createdAt)}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-white/70 text-sm">
                      <p>Belum ada hasil stage attempts</p>
                    </div>
                  )}
                </div>

                {/* Evaluasi Siswa */}
                {Object.keys(siswaGrouped).length > 0 && (
                  <div className="bg-white/10 rounded-lg p-4 border-2 border-white/30">
                    <h3 className="text-xl font-bold text-white mb-4">Evaluasi Siswa</h3>
                    {Object.entries(siswaGrouped).map(([stage, evals]) => (
                      <div key={stage} className="mb-4 last:mb-0">
                        <h4 className="font-bold text-white mb-2">
                          {STAGE_LABELS[stage] || stage.toUpperCase()}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {evals.process && (
                            <div className="bg-white/10 rounded p-3">
                              <h5 className="font-bold text-white text-sm mb-1">Evaluasi Proses</h5>
                              {evals.process.answers && evals.process.answers.length > 0 && (
                                <>
                                  {(() => {
                                    const score = calculateScore(evals.process.answers);
                                    const user = users[evals.process.userId || ''];
                                    return (
                                      <div className="text-white text-xs space-y-1">
                                        {user && <p><strong>Siswa:</strong> {user.name || user.username || user.email || '-'}</p>}
                                        <p><strong>Total Skor:</strong> {score.total}</p>
                                        <p><strong>Interpretasi:</strong> {score.interpretation} ({score.level})</p>
                                        <p><strong>Tanggal:</strong> {formatDate(evals.process.createdAt)}</p>
                                      </div>
                                    );
                                  })()}
                                </>
                              )}
                            </div>
                          )}

                          {evals.result && (
                            <div className="bg-white/10 rounded p-3">
                              <h5 className="font-bold text-white text-sm mb-1">Evaluasi Hasil</h5>
                              {evals.result.answers && evals.result.answers.length > 0 && (
                                <>
                                  {(() => {
                                    const score = calculateScore(evals.result.answers);
                                    const user = users[evals.result.userId || ''];
                                    return (
                                      <div className="text-white text-xs space-y-1">
                                        {user && <p><strong>Siswa:</strong> {user.name || user.username || user.email || '-'}</p>}
                                        <p><strong>Total Skor:</strong> {score.total}</p>
                                        <p><strong>Interpretasi:</strong> {score.interpretation} ({score.level})</p>
                                        <p><strong>Tanggal:</strong> {formatDate(evals.result.createdAt)}</p>
                                      </div>
                                    );
                                  })()}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </GameCard>
      </div>
    </div>
  );
}
