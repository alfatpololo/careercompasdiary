'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton, LoadingSpinner } from '../../../components/GameUI';
import { weightedStageOrder, type WeightedStageId } from '../../../lib/stageContent';

type TeacherStageId = 'start' | 'concern' | 'control' | 'curiosity' | 'confidence' | 'adapt';
const TEACHER_STAGE_ORDER: TeacherStageId[] = ['start', 'concern', 'control', 'curiosity', 'confidence', 'adapt'];

type StudentSummary = {
  id: string;
  name: string;
  email?: string;
  school?: string;
  highestStage: TeacherStageId;
  stageFlags: Record<TeacherStageId, boolean>;
  prePercent: number;
  postPercent: number;
  lastUpdated?: string;
  avatar: string;
};

const GREEN_STAGE_COLORS: Record<TeacherStageId, string> = {
  start: 'bg-emerald-200',
  concern: 'bg-emerald-300',
  control: 'bg-emerald-400',
  curiosity: 'bg-emerald-500',
  confidence: 'bg-emerald-600',
  adapt: 'bg-emerald-700',
};

const GREEN_STAGE_BORDER: Record<TeacherStageId, string> = {
  start: 'border-emerald-300',
  concern: 'border-emerald-400',
  control: 'border-emerald-500',
  curiosity: 'border-emerald-600',
  confidence: 'border-emerald-700',
  adapt: 'border-emerald-800',
};

const STAGE_LABELS: Record<TeacherStageId, string> = {
  start: 'Start (Pretest)',
  concern: 'Concern',
  control: 'Control',
  curiosity: 'Curiosity',
  confidence: 'Confidence',
  adapt: 'Adaptabilitas Karier (Posttest)',
};

function getAvatarInitial(name?: string, email?: string) {
  const source = name || email || '?';
  return source.trim().charAt(0).toUpperCase();
}

export default function PantauAktifitas() {
  const router = useRouter();
  const { user } = useAuth();
  const [studentSummaries, setStudentSummaries] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      router.push('/login');
      return;
    }

    // Check if user is guru
    let active = true;
    (async () => {
      try {
        const userRes = await fetch(`/api/users?userId=${encodeURIComponent(user.uid)}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.data?.role !== 'guru') {
            router.push('/profile');
            return;
          }
        }

        // Fetch students
        const res = await fetch('/api/users?role=siswa', { method: 'POST' });
        if (!res.ok) {
          throw new Error('Gagal memuat data siswa');
        }
        const data = await res.json();
        const students = data.data || [];

        const summaries = await Promise.all(
          students.map(async (student: { id: string; name?: string; email?: string }) => {
            try {
              const [stageRes] = await Promise.all([
                fetch(`/api/stage?userId=${encodeURIComponent(student.id)}`),
              ]);

              const stageData = stageRes.ok ? await stageRes.json() : { attempts: [] };
              const attempts = stageData.attempts || [];
              const stagePassed = new Set(
                attempts.filter((a: { passed?: boolean }) => a.passed).map((a: { stage: string }) => a.stage as WeightedStageId),
              );

              let highestStage: TeacherStageId = 'start';
              weightedStageOrder.forEach((stage) => {
                if (stagePassed.has(stage)) {
                  highestStage = stage as TeacherStageId;
                }
              });

              const stageFlags: Record<TeacherStageId, boolean> = {
                start: true,
                concern: stagePassed.has('concern'),
                control: stagePassed.has('control'),
                curiosity: stagePassed.has('curiosity'),
                confidence: stagePassed.has('confidence'),
                adapt: false,
              };

              return {
                id: student.id,
                name: (student as { username?: string; name?: string; email?: string }).username || (student as { name?: string; email?: string }).name || student.email || 'Siswa Tanpa Nama',
                email: student.email,
                school: (student as { namaSekolah?: string }).namaSekolah,
                highestStage,
                stageFlags,
                prePercent: 0,
                postPercent: 0,
                avatar: getAvatarInitial((student as { username?: string; name?: string; email?: string }).username || (student as { name?: string; email?: string }).name || student.email, student.email),
              };
            } catch (error) {
              console.error('Error processing student:', error);
              return null;
            }
          }),
        );

        if (active) {
          setStudentSummaries(summaries.filter((s): s is StudentSummary => s !== null));
        }
      } catch (error) {
        if (active) {
          setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, router]);

  // Group siswa berdasarkan stage mereka
  const studentsByStage = TEACHER_STAGE_ORDER.reduce<Record<TeacherStageId, StudentSummary[]>>((acc, stage) => {
    acc[stage] = studentSummaries.filter((student) => {
      if (stage === 'start') return true;
      if (stage === 'adapt') return student.stageFlags.adapt;
      return student.highestStage === stage || student.stageFlags[stage];
    });
    return acc;
  }, {
    start: [],
    concern: [],
    control: [],
    curiosity: [],
    confidence: [],
    adapt: [],
  });

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <LoadingSpinner size="lg" text="Memuat data..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{
        backgroundImage: 'url(/Background_Front.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <GameButton onClick={() => router.push('/')} className="from-blue-500 to-blue-600">
            ← Kembali ke Home
          </GameButton>
        </div>
        <GameCard className="bg-white/90 border-4 border-white/70 space-y-6 text-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Pantau Aktifitas Siswa</h2>
            <GameBadge className="bg-emerald-500/80 border-white">Monitoring Real-time</GameBadge>
          </div>

          {error ? (
            <div className="text-center font-semibold text-red-600 py-8">{error}</div>
          ) : (
            <div className="space-y-6">
              {TEACHER_STAGE_ORDER.map((stage) => {
                const students = studentsByStage[stage];
                return (
                  <div
                    key={stage}
                    className={`border-4 ${GREEN_STAGE_BORDER[stage]} rounded-2xl p-4 ${GREEN_STAGE_COLORS[stage]} bg-opacity-20`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-extrabold text-gray-800">{STAGE_LABELS[stage]}</h3>
                      <GameBadge className={`${GREEN_STAGE_COLORS[stage]} text-white border-white`}>
                        {students.length} Siswa
                      </GameBadge>
                    </div>

                    {students.length === 0 ? (
                      <p className="text-sm font-semibold text-gray-600">Belum ada siswa di stage ini</p>
                    ) : (
                      <div className="space-y-2">
                        {students.map((student) => (
                          <div
                            key={student.id}
                            className="bg-white/80 rounded-lg p-3 border-2 border-white flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-700 font-bold flex items-center justify-center text-sm">
                                {student.avatar}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                              </div>
                            </div>
                            <div className={`h-2 w-32 rounded-full ${GREEN_STAGE_COLORS[stage]} border-2 ${GREEN_STAGE_BORDER[stage]}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </GameCard>
      </div>
    </div>
  );
}

