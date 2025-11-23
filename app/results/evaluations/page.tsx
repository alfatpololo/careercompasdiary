'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton } from '../../../components/GameUI';
import { scoreToCategory } from '../../../lib/stageContent';

type EvaluationDoc = {
  id: string;
  type: string;
  answers?: number[];
  createdAt?: string;
};

type EvaluationResponse = {
  evaluations: EvaluationDoc[];
};

type EvalEntryConfig = {
  key: string;
  label: string;
  type: string;
  href: string;
  role: 'siswa' | 'guru';
};

type StageConfig = {
  stageId: string;
  title: string;
  description: string;
  entries: EvalEntryConfig[];
};

const evaluationStages: StageConfig[] = [
  {
    stageId: 'start',
    title: 'Mari Mengenal (START)',
    description:
      'Ringkasan evaluasi tahap pengenalan sebelum memasuki perjalanan Career Compass Diary.',
    entries: [
      {
        key: 'start-process',
        label: 'Evaluasi Proses (Siswa)',
        type: 'process',
        href: '/adaptabilitas/evaluation-process',
        role: 'siswa',
      },
      {
        key: 'start-result',
        label: 'Evaluasi Hasil (Siswa)',
        type: 'result',
        href: '/adaptabilitas/evaluation-result',
        role: 'siswa',
      },
    ],
  },
  {
    stageId: 'concern',
    title: 'Concern',
    description: 'Catatan evaluasi tahap kepedulian terhadap karier.',
    entries: [
      {
        key: 'concern-student-process',
        label: 'Evaluasi Proses (Siswa)',
        type: 'concern_student_process',
        href: '/concern/evaluation-process-student',
        role: 'siswa',
      },
      {
        key: 'concern-student-result',
        label: 'Evaluasi Hasil (Siswa)',
        type: 'concern_student_result',
        href: '/concern/evaluation-result-student',
        role: 'siswa',
      },
      {
        key: 'concern-teacher-process',
        label: 'Evaluasi Proses (Guru BK)',
        type: 'concern_teacher_process',
        href: '/concern/evaluation-process-teacher',
        role: 'guru',
      },
      {
        key: 'concern-teacher-result',
        label: 'Evaluasi Hasil (Guru BK)',
        type: 'concern_teacher_result',
        href: '/concern/evaluation-result-teacher',
        role: 'guru',
      },
    ],
  },
  {
    stageId: 'control',
    title: 'Control',
    description: 'Catatan evaluasi tahap kendali diri dan pengambilan keputusan.',
    entries: [
      {
        key: 'control-student-process',
        label: 'Evaluasi Proses (Siswa)',
        type: 'control_student_process',
        href: '/control/evaluation-process-student',
        role: 'siswa',
      },
      {
        key: 'control-student-result',
        label: 'Evaluasi Hasil (Siswa)',
        type: 'control_student_result',
        href: '/control/evaluation-result-student',
        role: 'siswa',
      },
      {
        key: 'control-teacher-process',
        label: 'Evaluasi Proses (Guru BK)',
        type: 'control_teacher_process',
        href: '/control/evaluation-process-teacher',
        role: 'guru',
      },
      {
        key: 'control-teacher-result',
        label: 'Evaluasi Hasil (Guru BK)',
        type: 'control_teacher_result',
        href: '/control/evaluation-result-teacher',
        role: 'guru',
      },
    ],
  },
  {
    stageId: 'curiosity',
    title: 'Curiosity',
    description: 'Catatan evaluasi tahap eksplorasi dan rasa ingin tahu.',
    entries: [
      {
        key: 'curiosity-student-process',
        label: 'Evaluasi Proses (Siswa)',
        type: 'curiosity_student_process',
        href: '/curiosity/evaluation-process-student',
        role: 'siswa',
      },
      {
        key: 'curiosity-student-result',
        label: 'Evaluasi Hasil (Siswa)',
        type: 'curiosity_student_result',
        href: '/curiosity/evaluation-result-student',
        role: 'siswa',
      },
      {
        key: 'curiosity-teacher-process',
        label: 'Evaluasi Proses (Guru BK)',
        type: 'curiosity_teacher_process',
        href: '/curiosity/evaluation-process-teacher',
        role: 'guru',
      },
      {
        key: 'curiosity-teacher-result',
        label: 'Evaluasi Hasil (Guru BK)',
        type: 'curiosity_teacher_result',
        href: '/curiosity/evaluation-result-teacher',
        role: 'guru',
      },
    ],
  },
  {
    stageId: 'confidence',
    title: 'Confidence',
    description: 'Catatan evaluasi tahap penguatan kepercayaan diri.',
    entries: [
      {
        key: 'confidence-student-process',
        label: 'Evaluasi Proses (Siswa)',
        type: 'confidence_student_process',
        href: '/confidence/evaluation-process-student',
        role: 'siswa',
      },
      {
        key: 'confidence-student-result',
        label: 'Evaluasi Hasil (Siswa)',
        type: 'confidence_student_result',
        href: '/confidence/evaluation-result-student',
        role: 'siswa',
      },
      {
        key: 'confidence-teacher-process',
        label: 'Evaluasi Proses (Guru BK)',
        type: 'confidence_teacher_process',
        href: '/confidence/evaluation-process-teacher',
        role: 'guru',
      },
      {
        key: 'confidence-teacher-result',
        label: 'Evaluasi Hasil (Guru BK)',
        type: 'confidence_teacher_result',
        href: '/confidence/evaluation-result-teacher',
        role: 'guru',
      },
    ],
  },
];

function formatDate(date?: string) {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date;
  }
}

function summariseAnswers(answers: number[] | undefined) {
  if (!answers || answers.length === 0) {
    return { sum: 0, max: 0, percent: 0, category: 'Rendah' as const };
  }
  const sum = answers.reduce((acc, val) => acc + (Number(val) || 0), 0);
  const max = answers.length * 3;
  const percent = Math.round(((sum / max) || 0) * 100);
  return {
    sum,
    max,
    percent,
    category: scoreToCategory(Math.round((percent / 100) * 240), 240),
  };
}

type UserDoc = {
  role?: 'guru' | 'siswa';
};

export default function EvaluationResults() {
  const router = useRouter();
  const { user } = useAuth();
  const [docs, setDocs] = useState<EvaluationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'guru' | 'siswa' | null>(null);

  // Fetch user role
  useEffect(() => {
    if (!user?.uid) {
      setUserRole(null);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/users?userId=${encodeURIComponent(user.uid)}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setUserRole((data.data as UserDoc)?.role || null);
          }
        }
      } catch (error) {
        console.error('[Evaluations] Failed to fetch user role:', error);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;

    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/evaluation?userId=${encodeURIComponent(user.uid)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Gagal memuat evaluasi');
        }
        const data = (await res.json()) as EvaluationResponse;
        setDocs(data.evaluations || []);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('[Evaluations] fetch error:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga');
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [user?.uid]);

  const latestByType = useMemo(() => {
    const map = new Map<string, EvaluationDoc>();
    docs.forEach((doc) => {
      const existing = map.get(doc.type);
      if (!existing) {
        map.set(doc.type, doc);
        return;
      }
      const existingDate = existing.createdAt ? new Date(existing.createdAt).getTime() : 0;
      const currentDate = doc.createdAt ? new Date(doc.createdAt).getTime() : 0;
      if (currentDate > existingDate) {
        map.set(doc.type, doc);
      }
    });
    return map;
  }, [docs]);

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
            Silakan login terlebih dahulu untuk melihat rangkuman evaluasi.
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
            <GameBadge className="bg-emerald-500/90 text-white border-0">
              Evaluasi Hasil & Proses
            </GameBadge>
            <h1 className="text-3xl font-extrabold drop-shadow mt-2">
              Rekap Evaluasi dari Mari Mengenal hingga Adaptabilitas Karier
            </h1>
            <p className="text-white/85 font-semibold max-w-3xl">
              Setiap entri menampilkan nilai total, persentase, dan kategori interpretasi. Gunakan tombol di
              bawah untuk membuka kembali lembar evaluasi bila diperlukan.
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
            Memuat data evaluasi...
          </GameCard>
        ) : error ? (
          <GameCard className="bg-red-100 border-2 border-red-300 text-red-700 font-semibold">
            {error}
          </GameCard>
        ) : (
          evaluationStages.map((stage) => {
            // Filter entries berdasarkan role user
            // Jika siswa, hanya tampilkan entries dengan role 'siswa'
            // Jika guru, tampilkan semua entries
            const filteredEntries = userRole === 'siswa' 
              ? stage.entries.filter(entry => entry.role === 'siswa')
              : stage.entries;

            // Skip stage jika tidak ada entries setelah filter
            if (filteredEntries.length === 0) return null;

            return (
            <GameCard
              key={stage.stageId}
              className="bg-gradient-to-br from-white/90 to-white/60 !text-gray-800 border-4 border-white/70 space-y-4"
            >
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold drop-shadow-sm !text-gray-800">{stage.title}</h2>
                <p className="text-sm font-semibold !text-gray-600">{stage.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {filteredEntries.map((entry) => {
                  const doc = latestByType.get(entry.type);
                  const summary = summariseAnswers(doc?.answers);
                  const hasData = !!doc && summary.max > 0;
                  return (
                    <div
                      key={entry.key}
                      className="bg-white/75 rounded-2xl border-2 border-white/60 p-4 space-y-3 flex flex-col"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase !text-emerald-600 tracking-wide">
                          {entry.role === 'siswa' ? 'Siswa' : 'Guru BK'}
                        </span>
                        <span className="text-xs font-semibold !text-gray-600">
                          {formatDate(doc?.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold !text-gray-900">{entry.label}</h3>

                      {hasData ? (
                        <>
                          <div className="flex items-baseline gap-3">
                            <p className="text-3xl font-black !text-emerald-600">
                              {summary.sum}
                              <span className="text-base font-semibold !text-gray-700"> / {summary.max}</span>
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold !text-gray-800">
                                {summary.percent}% • {summary.category}
                              </p>
                              <p className="text-xs !text-gray-600">
                                Interpretasi kategori menggunakan skala 1-3 tiap pernyataan.
                              </p>
                            </div>
                          </div>
                          <GameButton
                            onClick={() => router.push(entry.href)}
                            className="mt-auto from-green-500 to-emerald-600"
                          >
                            Buka Lembar Evaluasi
                          </GameButton>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold !text-gray-800">
                            Belum ada jawaban yang tersimpan untuk formulir ini.
                          </p>
                          <GameButton
                            onClick={() => router.push(entry.href)}
                            className="mt-auto from-yellow-400 to-orange-500"
                          >
                            Isi Evaluasi Sekarang
                          </GameButton>
                        </>
                      )}
                    </div>
                  );
                })}
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


