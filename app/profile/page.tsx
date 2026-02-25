'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton, LoadingSpinner, LoadingOverlay } from '../../components/GameUI';
import {
  weightedStageOrder,
  type WeightedStageId,
  scoreToCategory,
  weightedAssessment,
  weightedIntroSlides,
} from '../../lib/stageContent';

type FirestoreTimestamp = { _seconds?: number; _nanoseconds?: number; seconds?: number; nanoseconds?: number };

type UserDoc = {
  id: string;
  username?: string;
  role?: 'guru' | 'siswa';
  usia?: number;
  jenisKelamin?: string;
  phone?: string;
  alamat?: string;
  namaSekolah?: string;
  email?: string;
  progress?: Array<{ levelId: string; completed: boolean; score: number; completedAt?: unknown }>;
  createdAt?: unknown;
  updatedAt?: unknown;
};

type QuizDoc = {
  id: string;
  scores?: Record<string, number>;
  percent?: number;
  createdAt?: string;
};

type QuizResponse = { results: QuizDoc[] };

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
};

type EvaluationDoc = {
  id: string;
  type: string;
  answers?: number[];
  createdAt?: string;
};

type EvaluationResponse = {
  evaluations: EvaluationDoc[];
};

type DiaryDoc = {
  id: string;
  stage?: string;
  judul?: string;
  isi?: string;
  createdAt?: string;
  tanggal?: string;
};

type DiaryResponse = {
  diaries: DiaryDoc[];
};

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

type TeacherStageId = 'start' | 'concern' | 'control' | 'curiosity' | 'confidence' | 'adapt';

const TEACHER_STAGE_ORDER: TeacherStageId[] = ['start', 'concern', 'control', 'curiosity', 'confidence', 'adapt'];

const STAGE_META: Record<TeacherStageId, { label: string; color: string }> = {
  start: { label: 'Start', color: 'bg-blue-500' },
  concern: { label: 'Concern', color: 'bg-sky-500' },
  control: { label: 'Control', color: 'bg-emerald-500' },
  curiosity: { label: 'Curiosity', color: 'bg-purple-500' },
  confidence: { label: 'Confidence', color: 'bg-orange-500' },
  adapt: { label: 'Adaptabilitas', color: 'bg-yellow-500' },
};

const STUDENT_STAGE_META: Record<WeightedStageId, { label: string; color: string }> = {
  concern: { label: 'Concern', color: 'bg-sky-500/70' },
  control: { label: 'Control', color: 'bg-emerald-500/70' },
  curiosity: { label: 'Curiosity', color: 'bg-purple-500/70' },
  confidence: { label: 'Confidence', color: 'bg-orange-500/70' },
};

const PROCESS_TYPES = [
  'concern_student_process',
  'control_student_process',
  'curiosity_student_process',
  'confidence_student_process',
];

const RESULT_TYPES = [
  'result',
  'concern_student_result',
  'control_student_result',
  'curiosity_student_result',
  'confidence_student_result',
];

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    const ts = value as FirestoreTimestamp;
    const seconds = ts._seconds ?? ts.seconds;
    if (typeof seconds === 'number') {
      return new Date(seconds * 1000).toISOString();
    }
  }
  return undefined;
}

function formatDate(value?: unknown): string {
  const iso = toIsoString(value);
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function getAvatarInitial(name?: string, email?: string) {
  const source = name || email || '?';
  return source.trim().charAt(0).toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [pretest, setPretest] = useState<QuizDoc | null>(null);
  const [stageAttempts, setStageAttempts] = useState<StageAttempt[]>([]);
  const [evaluationDocs, setEvaluationDocs] = useState<EvaluationDoc[]>([]);
  const [diaryDocs, setDiaryDocs] = useState<DiaryDoc[]>([]);

  const [studentSummaries, setStudentSummaries] = useState<StudentSummary[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    let active = true;
    (async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const res = await fetch(`/api/users?userId=${encodeURIComponent(user.uid)}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Gagal memuat data profil');
        }
        const data = await res.json();
        if (active) {
          setUserDoc(data.data as UserDoc);
        }
      } catch (error) {
        console.error('[Profile] load error:', error);
        if (active) {
          setProfileError(error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga');
        }
      } finally {
        if (active) setProfileLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || userDoc?.role !== 'siswa') return;
    let active = true;
    (async () => {
      try {
        const [quizRes, stageRes, evalRes, diaryRes] = await Promise.all([
          fetch(`/api/quiz?userId=${encodeURIComponent(user.uid)}`),
          fetch(`/api/stage?userId=${encodeURIComponent(user.uid)}`),
          fetch(`/api/evaluation?userId=${encodeURIComponent(user.uid)}`),
          fetch(`/api/diary?userId=${encodeURIComponent(user.uid)}`),
        ]);

        if (quizRes.ok) {
          const quizData = (await quizRes.json()) as QuizResponse;
          // Ambil pretest (isPosttest === false atau undefined), bukan posttest
          const pretestResult = quizData.results?.find((r) => !(r as { isPosttest?: boolean }).isPosttest) ?? null;
          if (active) setPretest(pretestResult);
        }

        if (stageRes.ok) {
          const stageData = (await stageRes.json()) as StageResponse;
          if (active) setStageAttempts(stageData.attempts || []);
        }

        if (evalRes.ok) {
          const evalData = (await evalRes.json()) as EvaluationResponse;
          if (active) setEvaluationDocs(evalData.evaluations || []);
        }

        if (diaryRes.ok) {
          const diaryData = (await diaryRes.json()) as DiaryResponse;
          if (active) setDiaryDocs(diaryData.diaries || []);
        }
      } catch (error) {
        console.error('[Profile] student data load error:', error);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.uid, userDoc?.role]);

  useEffect(() => {
    if (userDoc?.role !== 'guru') return;
    let active = true;
    (async () => {
      setStudentsLoading(true);
      setStudentsError(null);
      try {
        const res = await fetch('/api/users?role=siswa', { method: 'POST' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Gagal memuat data siswa');
        }
        const data = await res.json();
        const students: UserDoc[] = data.data || [];

        const summaries = await Promise.all(
          students.map(async (student) => {
            try {
              const [stageRes, quizRes, diaryRes] = await Promise.all([
                fetch(`/api/stage?userId=${encodeURIComponent(student.id)}`),
                fetch(`/api/quiz?userId=${encodeURIComponent(student.id)}`),
                fetch(`/api/diary?userId=${encodeURIComponent(student.id)}&stage=adaptabilitas`),
              ]);

              const stageData = stageRes.ok ? ((await stageRes.json()) as StageResponse) : { attempts: [] };
              const quizData = quizRes.ok ? ((await quizRes.json()) as QuizResponse) : { results: [] };
              const diaryData = diaryRes.ok ? ((await diaryRes.json()) as DiaryResponse) : { diaries: [] };

              const attempts = stageData.attempts || [];
              const stagePassed = new Set(
                attempts.filter((a) => a.passed).map((a) => a.stage as WeightedStageId),
              );
              const postPercents = attempts
                .filter((a) => (weightedStageOrder as readonly string[]).includes(a.stage))
                .map((a) => {
                  const max = weightedAssessment[a.stage as WeightedStageId].length * 40;
                  return Math.round((a.score / max) * 100);
                });
              const postPercent =
                postPercents.length > 0
                  ? Math.round(postPercents.reduce((acc, val) => acc + val, 0) / postPercents.length)
                  : 0;

              // Ambil pretest (isPosttest === false atau undefined), bukan posttest
              const preDoc = quizData.results?.find((r) => !(r as { isPosttest?: boolean }).isPosttest) ?? null;
              const scores = preDoc?.scores ?? {};
              const prePercentRaw = weightedStageOrder.map((stage) => {
                const max = 30;
                const score = scores[stage] ?? 0;
                return Math.round((score / max) * 100);
              });
              const prePercent =
                prePercentRaw.length > 0
                  ? Math.round(prePercentRaw.reduce((acc, val) => acc + val, 0) / prePercentRaw.length)
                  : 0;

              let highestStage: TeacherStageId = 'start';
              weightedStageOrder.forEach((stage) => {
                if (stagePassed.has(stage)) {
                  highestStage = stage as TeacherStageId;
                }
              });
              const adaptDone = (diaryData.diaries || []).length > 0;
              if (adaptDone) highestStage = 'adapt';

              const stageFlags: Record<TeacherStageId, boolean> = {
                start: true,
                concern: stagePassed.has('concern'),
                control: stagePassed.has('control'),
                curiosity: stagePassed.has('curiosity'),
                confidence: stagePassed.has('confidence'),
                adapt: adaptDone,
              };

              const lastAttempt = attempts[0];

              return {
                id: student.id,
                name: student.username || student.email || 'Siswa Tanpa Nama',
                email: student.email,
                school: student.namaSekolah,
                highestStage,
                stageFlags,
                prePercent,
                postPercent,
                lastUpdated: lastAttempt?.createdAt,
                avatar: getAvatarInitial(student.username, student.email),
              };
            } catch (error) {
              console.error('[Profile] student summary error:', error);
              return {
                id: student.id,
                name: student.username || student.email || 'Siswa Tanpa Nama',
                email: student.email,
                school: student.namaSekolah,
                highestStage: 'start' as TeacherStageId,
                stageFlags: {
                  start: true,
                  concern: false,
                  control: false,
                  curiosity: false,
                  confidence: false,
                  adapt: false,
                },
                prePercent: 0,
                postPercent: 0,
                avatar: getAvatarInitial(student.username, student.email),
              };
            }
          }),
        );

        if (active) setStudentSummaries(summaries);
      } catch (error) {
        console.error('[Profile] load students error:', error);
        if (active) {
          setStudentsError(error instanceof Error ? error.message : 'Terjadi kesalahan tak terduga');
        }
      } finally {
        if (active) setStudentsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userDoc?.role]);

  const stageLatest = useMemo(() => {
    const map = new Map<WeightedStageId, StageAttempt>();
    stageAttempts.forEach((attempt) => {
      if (!(weightedStageOrder as readonly string[]).includes(attempt.stage)) return;
      const stage = attempt.stage as WeightedStageId;
      if (!map.has(stage)) {
        map.set(stage, attempt);
        return;
      }
      const existing = map.get(stage)!;
      if (new Date(attempt.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
        map.set(stage, attempt);
      }
    });
    return map;
  }, [stageAttempts]);

  const stagePassed = useMemo(() => {
    const status: Record<WeightedStageId, boolean> = {
      concern: false,
      control: false,
      curiosity: false,
      confidence: false,
    };
    (weightedStageOrder as readonly WeightedStageId[]).forEach((stage) => {
      status[stage] = !!stageLatest.get(stage)?.passed;
    });
    return status;
  }, [stageLatest]);

  const evaluationMap = useMemo(() => {
    const map = new Map<string, EvaluationDoc>();
    evaluationDocs.forEach((doc) => {
      const existing = map.get(doc.type);
      if (!existing) {
        map.set(doc.type, doc);
        return;
      }
      const existingTime = existing.createdAt ? new Date(existing.createdAt).getTime() : 0;
      const currentTime = doc.createdAt ? new Date(doc.createdAt).getTime() : 0;
      if (currentTime > existingTime) map.set(doc.type, doc);
    });
    return map;
  }, [evaluationDocs]);

  const diariesByStage = useMemo(() => {
    const map = new Map<string, DiaryDoc[]>();
    diaryDocs.forEach((doc) => {
      const stage = doc.stage || 'start';
      if (!map.has(stage)) map.set(stage, []);
      map.get(stage)!.push(doc);
    });
    return map;
  }, [diaryDocs]);

  const studentStatusList = useMemo(() => {
    if (userDoc?.role !== 'siswa') return [];

    const lastLoginIso = user?.metadata?.lastSignInTime
      ? new Date(user.metadata.lastSignInTime).toISOString()
      : undefined;

    const allStagesPassed = (weightedStageOrder as readonly WeightedStageId[]).every(
      (stage) => stagePassed[stage],
    );

    const processComplete = PROCESS_TYPES.every((type) => evaluationMap.has(type));
    const resultComplete = RESULT_TYPES.every((type) => evaluationMap.has(type));
    const diaryAdapt = diariesByStage.get('adaptabilitas')?.length ?? 0;

    const statuses = [
      {
        id: 'register',
        title: 'Registrasi Akun',
        description: 'Akun Career Compass Diary berhasil dibuat.',
        completed: true,
        date: userDoc?.createdAt,
      },
      {
        id: 'login',
        title: 'Login Terakhir',
        description: 'Terhubung ke sistem Career Compass Diary.',
        completed: true,
        date: lastLoginIso,
      },
      {
        id: 'caas1',
        title: 'CAAS I (Pretest)',
        description: 'Pengisian instrumen adaptabilitas karier sebelum memulai Journey.',
        completed: !!pretest,
        date: pretest?.createdAt,
      },
      {
        id: 'concern',
        title: 'Assessment Concern',
        description: 'Menyelesaikan tahap Concern dengan status lulus.',
        completed: stagePassed.concern,
        date: stageLatest.get('concern')?.createdAt,
      },
      {
        id: 'control',
        title: 'Assessment Control',
        description: 'Menyelesaikan tahap Control dengan status lulus.',
        completed: stagePassed.control,
        date: stageLatest.get('control')?.createdAt,
      },
      {
        id: 'curiosity',
        title: 'Assessment Curiosity',
        description: 'Menyelesaikan tahap Curiosity dengan status lulus.',
        completed: stagePassed.curiosity,
        date: stageLatest.get('curiosity')?.createdAt,
      },
      {
        id: 'confidence',
        title: 'Assessment Confidence',
        description: 'Menyelesaikan tahap Confidence dengan status lulus.',
        completed: stagePassed.confidence,
        date: stageLatest.get('confidence')?.createdAt,
      },
      {
        id: 'caas2',
        title: 'CAAS II (Posttest)',
        description: 'Seluruh assessment tahap Journey telah lulus.',
        completed: allStagesPassed,
        date: stageLatest.get('confidence')?.createdAt,
      },
      {
        id: 'evaluasi-proses',
        title: 'Evaluasi Proses',
        description: 'Form evaluasi proses untuk setiap tahap sudah diisi.',
        completed: processComplete,
        date: PROCESS_TYPES.map((type) => evaluationMap.get(type)?.createdAt).find(Boolean),
      },
      {
        id: 'evaluasi-hasil',
        title: 'Evaluasi Hasil',
        description: 'Form evaluasi hasil telah diselesaikan.',
        completed: resultComplete,
        date: RESULT_TYPES.map((type) => evaluationMap.get(type)?.createdAt).find(Boolean),
      },
      {
        id: 'hasil',
        title: 'Rangkuman Hasil',
        description: 'Telah mengakses halaman hasil adaptabilitas karier.',
        completed: !!pretest || allStagesPassed,
        date: pretest?.createdAt || stageLatest.get('confidence')?.createdAt,
      },
      {
        id: 'selesai',
        title: 'Selesai',
        description: 'Semua tahapan utama dan evaluasi telah diselesaikan.',
        completed: allStagesPassed && processComplete && resultComplete && diaryAdapt > 0,
        date: diaryAdapt > 0 ? diariesByStage.get('adaptabilitas')?.[0]?.createdAt : undefined,
      },
    ];

    return statuses;
  }, [userDoc?.role, user, userDoc?.createdAt, pretest, stagePassed, stageLatest, evaluationMap, diariesByStage]);

  const handleLogout = async () => {
    if (!window.confirm('Apakah Anda yakin ingin logout?')) {
      return;
    }
    
    setLogoutLoading(true);
    try {
      await logout();
      // Tunggu sebentar untuk menampilkan loading dan animasi
      await new Promise(resolve => setTimeout(resolve, 800));
      // Redirect ke login setelah logout berhasil
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Terjadi kesalahan saat logout');
      setLogoutLoading(false);
    }
  };

  const isTeacher = userDoc?.role === 'guru';
  
  const profileNav = (
    <nav className="flex flex-wrap gap-2 justify-end">
      {[
        { label: 'Home', href: '/' },
        ...(isTeacher ? [] : [{ label: 'Journey', href: '/journey' }]), // Hide Journey for teachers
        ...(isTeacher ? [] : [{ label: 'Hasil', href: '/results' }]), // Hide Hasil for teachers
        ...(isTeacher ? [] : [{ label: '🏆 Peringkat', href: '/leaderboard' }]), // Leaderboard untuk siswa
        { label: 'Tentang', href: '/tentang' },
        ...(isTeacher ? [] : [{ label: 'Profil', href: '/profile' }]), // Hide Profil for teachers (they have menu in navbar)
      ].map((item) => (
        <GameButton key={item.href} onClick={() => router.push(item.href)} className="from-green-500 to-emerald-600 text-[10px] sm:text-xs px-2 py-1 sm:px-4 sm:py-2">
          {item.label}
        </GameButton>
      ))}
      <GameButton onClick={handleLogout} disabled={logoutLoading} className="from-red-500 to-red-600 text-[10px] sm:text-xs px-2 py-1 sm:px-4 sm:py-2">
        {logoutLoading ? 'Logging out...' : 'Logout'}
      </GameButton>
    </nav>
  );

  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white/90 rounded-2xl shadow-2xl px-8 py-12 max-w-md w-full text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Akses Diperlukan</h2>
          <p className="text-gray-600 mb-6">
            Silakan login untuk melihat profil dan aktivitas Anda.
          </p>
          <GameButton onClick={() => router.push('/login')} className="from-blue-500 to-blue-700">
            Login Sekarang
          </GameButton>
        </div>
      </div>
    );
  }

  if (profileLoading) {
  return (
    <div 
        className="min-h-screen py-10 px-4 flex items-center justify-center"
      style={{
        backgroundImage: 'url(/Background_Front.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        }}
      >
        <LoadingSpinner size="lg" text="Memuat profil..." fullScreen={false} />
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay isLoading={logoutLoading} text="Memproses logout..." />
      <div
        className="min-h-screen py-10 px-4"
              style={{
          backgroundImage: 'url(/Background_Front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-white">
          <div>
            <GameBadge className="bg-emerald-500/90 border-white">
              {isTeacher ? 'Dashboard Guru BK' : 'Profil Siswa'}
            </GameBadge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold drop-shadow">
              {userDoc?.username || user.displayName || user.email || 'Pengguna'}
            </h1>
            <p className="text-white/85 font-semibold">
              {isTeacher
                ? 'Pantau aktivitas siswa Career Compass Diary secara real-time.'
                : 'Lihat biodata, pantau progres, dan lanjutkan perjalanan adaptabilitas kariermu.'}
            </p>
          </div>
          {profileNav}
        </div>

        {profileError && (
          <GameCard className="bg-red-100 border-2 border-red-300 text-red-700 font-semibold">
            {profileError}
          </GameCard>
        )}

        {profileLoading ? (
          <GameCard className="bg-white/80 text-center text-gray-700 font-semibold">
            Memuat data profil...
          </GameCard>
        ) : isTeacher ? (
          <TeacherView
            userDoc={userDoc}
            studentSummaries={studentSummaries}
            studentsLoading={studentsLoading}
            studentsError={studentsError}
          />
        ) : (
          <StudentView
            user={user}
            userDoc={userDoc}
            pretest={pretest}
            stageLatest={stageLatest}
            stagePassed={stagePassed}
            statusList={studentStatusList}
            diariesByStage={diariesByStage}
            evaluationMap={evaluationMap}
          />
        )}
        </div>
      </div>
    </>
  );
}

function StudentView({
  user,
  userDoc,
  pretest,
  stageLatest,
  stagePassed,
  statusList,
  diariesByStage,
  evaluationMap,
}: {
  user: ReturnType<typeof useAuth>['user'];
  userDoc: UserDoc | null;
  pretest: QuizDoc | null;
  stageLatest: Map<WeightedStageId, StageAttempt>;
  stagePassed: Record<WeightedStageId, boolean>;
  statusList: Array<{ id: string; title: string; description: string; completed: boolean; date?: unknown }>;
  diariesByStage: Map<string, DiaryDoc[]>;
  evaluationMap: Map<string, EvaluationDoc>;
}) {
  const prePercent =
    pretest?.percent !== undefined ? Math.round(pretest.percent) : undefined;
  const postPercents = (weightedStageOrder as readonly WeightedStageId[])
    .map((stage) => {
      const attempt = stageLatest.get(stage);
      if (!attempt) return null;
      const max = weightedAssessment[stage].length * 40;
      return Math.round((attempt.score / max) * 100);
    })
    .filter((val): val is number => val !== null);

  const postAverage =
    postPercents.length > 0
      ? Math.round(postPercents.reduce((acc, val) => acc + val, 0) / postPercents.length)
      : undefined;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GameCard className="bg-white/90 border-4 border-white/70 space-y-4 text-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold">Biodata Siswa</h2>
            <GameBadge className="bg-blue-500/80 border-white">Identitas</GameBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
            <Field label="Nama Lengkap" value={userDoc?.username || user?.displayName || '-'} />
            <Field label="Email" value={userDoc?.email || user?.email} />
            <Field label="Peran" value="Siswa" />
            <Field label="Usia" value={userDoc?.usia ? `${userDoc.usia} tahun` : '-'} />
            <Field label="Jenis Kelamin" value={userDoc?.jenisKelamin} />
            <Field label="No. WA" value={userDoc?.phone} />
            <Field label="Nama Sekolah" value={userDoc?.namaSekolah} span />
            <Field label="Alamat" value={userDoc?.alamat} span />
            <Field label="Terdaftar Pada" value={formatDate(userDoc?.createdAt)} span />
            <Field label="Login Terakhir" value={formatDate(user?.metadata?.lastSignInTime)} span />
          </div>
        </GameCard>

        <GameCard className="bg-white/90 border-4 border-white/70 space-y-4 text-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold">Pantau Aktivitas</h2>
            <GameBadge className="bg-emerald-500/80 border-white">Progres</GameBadge>
          </div>

          <div className="space-y-3 max-h-[24rem] overflow-auto pr-2">
            {statusList.map((status) => (
              <div
                key={status.id}
                className={`rounded-2xl border-2 p-3 ${
                  status.completed
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{status.title}</span>
                  <span className="text-xs font-semibold">
                    {status.completed ? '✔' : '⏳'} {formatDate(status.date)}
                  </span>
                </div>
                <p className="text-xs">{status.description}</p>
              </div>
            ))}
          </div>
        </GameCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GameCard className="bg-white/90 border-4 border-white/70 space-y-4 text-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold">Status Stage Adaptabilitas</h2>
            <GameBadge className="bg-purple-500/80 border-white">Journey</GameBadge>
          </div>

          <div className="space-y-3">
            {(weightedStageOrder as readonly WeightedStageId[]).map((stage) => {
              const attempt = stageLatest.get(stage);
              const meta = STUDENT_STAGE_META[stage];
              const percent = attempt
                ? Math.round((attempt.score / (weightedAssessment[stage].length * 40)) * 100)
                : 0;
              return (
                <div
                  key={stage}
                  className="rounded-2xl border-2 border-white/60 bg-white/60 p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <GameBadge className={`${meta.color} border-white`}>{meta.label}</GameBadge>
                    <span className="text-xs font-semibold text-gray-500">
                      {formatDate(attempt?.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>{stagePassed[stage] ? 'Lulus ✅' : 'Belum Lulus ⚠️'}</span>
                    <span>{percent}% • {scoreToCategory(attempt?.score ?? 0, 240)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <GameButton onClick={() => location.assign('/results/adaptability')} className="from-green-500 to-emerald-600">
              Detail Hasil
            </GameButton>
            <GameButton onClick={() => location.assign('/quiz/concern?mode=assessment')} className="from-blue-500 to-indigo-600">
              Mulai Assessment
            </GameButton>
          </div>
        </GameCard>

        <GameCard className="bg-white/90 border-4 border-white/70 space-y-4 text-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold">Refleksi & Evaluasi</h2>
            <GameBadge className="bg-orange-500/80 border-white">Refleksi</GameBadge>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SummaryStat
              label="Skor CAAS I"
              value={prePercent !== undefined ? `${prePercent}%` : '-'}
              sub={prePercent !== undefined ? scoreToCategory(Math.round((prePercent / 100) * 240), 240) : 'Belum tersedia'}
              accent="bg-blue-500/80"
            />
            <SummaryStat
              label="Rata-rata Posttest"
              value={postAverage !== undefined ? `${postAverage}%` : '-'}
              sub={postAverage !== undefined ? scoreToCategory(Math.round((postAverage / 100) * 240), 240) : 'Belum tersedia'}
              accent="bg-emerald-500/80"
            />
            <SummaryStat
              label="Evaluasi Proses"
              value={PROCESS_TYPES.filter((type) => evaluationMap.has(type)).length.toString()}
              sub="Form siswa tahap Concern - Confidence"
              accent="bg-purple-500/80"
            />
            <SummaryStat
              label="Catatan Harian"
              value={Array.from(diariesByStage.values()).reduce((acc, arr) => acc + arr.length, 0).toString()}
              sub="Total refleksi tersimpan"
              accent="bg-orange-500/80"
            />
              </div>

          <div className="bg-white/70 border border-white/60 rounded-2xl p-3 text-sm font-semibold text-gray-700 space-y-2">
            <p>
              Simpan progresmu: isi catatan harian setelah setiap tahap dan selesaikan evaluasi proses &
              hasil. Gunakan tombol berikut untuk melanjutkan.
            </p>
            <div className="flex flex-wrap gap-2">
              <GameButton onClick={() => location.assign('/results/diary')} className="from-yellow-400 to-orange-500 text-xs">
                Lihat Catatan
              </GameButton>
              <GameButton onClick={() => location.assign('/results/evaluations')} className="from-blue-500 to-indigo-600 text-xs">
                Evaluasi Lengkap
              </GameButton>
              <GameButton onClick={() => location.assign('/leaderboard')} className="from-amber-500 to-amber-600 text-xs">
                🏆 Lihat Peringkat
              </GameButton>
              <GameButton onClick={() => location.assign('/concern/diary')} className="from-green-500 to-emerald-600 text-xs">
                Isi Diary Concern
              </GameButton>
            </div>
          </div>
        </GameCard>
      </div>
    </>
  );
}

function TeacherView({
  userDoc,
  studentSummaries,
  studentsLoading,
  studentsError,
}: {
  userDoc: UserDoc | null;
  studentSummaries: StudentSummary[];
  studentsLoading: boolean;
  studentsError: string | null;
}) {
  const [activeTab, setActiveTab] = useState<'biodata' | 'pantau' | 'data-siswa' | 'cms-intro' | 'cms-quiz' | 'cms-evaluation' | 'cms-caas'>('biodata');
  
  const totalStudents = studentSummaries.length;
  const counts = TEACHER_STAGE_ORDER.reduce<Record<TeacherStageId, number>>((acc, stage) => {
    acc[stage] = studentSummaries.filter((summary) => summary.highestStage === stage).length;
    return acc;
  }, {
    start: 0,
    concern: 0,
    control: 0,
    curiosity: 0,
    confidence: 0,
    adapt: 0,
  });

  // Warna hijau berbeda untuk setiap stage (dalam keluarga hijau)
  const GREEN_STAGE_COLORS: Record<TeacherStageId, string> = {
    start: 'bg-emerald-200',      // Hijau muda
    concern: 'bg-emerald-300',     // Hijau agak muda
    control: 'bg-emerald-400',     // Hijau sedang
    curiosity: 'bg-emerald-500',   // Hijau standar
    confidence: 'bg-emerald-600',   // Hijau agak gelap
    adapt: 'bg-emerald-700',       // Hijau gelap
  };

  const GREEN_STAGE_BORDER: Record<TeacherStageId, string> = {
    start: 'border-emerald-300',
    concern: 'border-emerald-400',
    control: 'border-emerald-500',
    curiosity: 'border-emerald-600',
    confidence: 'border-emerald-700',
    adapt: 'border-emerald-800',
  };

  const menuTabs = [
    { id: 'biodata' as const, label: 'Biodata Guru', icon: '👤' },
    { id: 'pantau' as const, label: 'Pantau Aktifitas', icon: '📊' },
    { id: 'data-siswa' as const, label: 'Tampilan Data Siswa', icon: '👥' },
    { id: 'cms-intro' as const, label: 'CMS Intro', icon: '📝' },
    { id: 'cms-quiz' as const, label: 'CMS Quiz', icon: '✏️' },
    { id: 'cms-evaluation' as const, label: 'CMS Intro Evaluasi', icon: '📋' },
    { id: 'cms-caas' as const, label: 'CMS CAAS I & II', icon: '📄' },
  ];

  return (
    <>
      {/* Menu Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {menuTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white shadow-lg scale-105'
                : 'bg-white/80 text-gray-700 hover:bg-white/90'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Biodata Guru Tab */}
      {activeTab === 'biodata' && (
        <GameCard className="bg-white/90 border-4 border-white/70 space-y-4 text-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Biodata Guru BK / Konselor</h2>
            <GameBadge className="bg-indigo-500/80 border-white">Identitas</GameBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
            <Field label="Nama Lengkap" value={userDoc?.username} />
            <Field label="Email" value={userDoc?.email} />
            <Field label="Peran" value="Guru BK / Konselor" />
            <Field label="No. WA" value={userDoc?.phone} />
            <Field label="Instansi" value={userDoc?.namaSekolah} span />
            <Field label="Alamat" value={userDoc?.alamat} span />
            <Field label="Terdaftar Pada" value={formatDate(userDoc?.createdAt)} span />
          </div>
        </GameCard>
      )}

      {/* Pantau Aktifitas Tab */}
      {activeTab === 'pantau' && (
        <PantauAktifitasView
          studentSummaries={studentSummaries}
          studentsLoading={studentsLoading}
          studentsError={studentsError}
          greenStageColors={GREEN_STAGE_COLORS}
          greenStageBorder={GREEN_STAGE_BORDER}
        />
      )}

      {/* Tampilan Data Siswa Tab */}
      {activeTab === 'data-siswa' && (
        <DataSiswaView
          studentSummaries={studentSummaries}
          studentsLoading={studentsLoading}
          studentsError={studentsError}
        />
      )}

      {/* CMS Intro Tab */}
      {activeTab === 'cms-intro' && (
        <CMSIntroView />
      )}

      {/* CMS Quiz Tab */}
      {activeTab === 'cms-quiz' && (
        <CMSQuizView />
      )}

      {/* CMS Intro Evaluasi Tab - redirect ke halaman khusus */}
      {activeTab === 'cms-evaluation' && (
        <GameCard className="bg-white/90 border-4 border-white/70 space-y-4">
          <h2 className="text-xl font-extrabold text-gray-800">CMS Intro Evaluasi</h2>
          <p className="text-gray-600">Edit pernyataan evaluasi untuk setiap tahap (Evaluasi Proses & Evaluasi Hasil).</p>
          <GameButton onClick={() => location.assign('/guru/cms-evaluation')} className="from-amber-500 to-amber-600">
            Buka CMS Intro Evaluasi
          </GameButton>
        </GameCard>
      )}

      {/* CMS CAAS I & II Tab */}
      {activeTab === 'cms-caas' && (
        <GameCard className="bg-white/90 border-4 border-white/70 space-y-4">
          <h2 className="text-xl font-extrabold text-gray-800">CMS CAAS I & CAAS II</h2>
          <p className="text-gray-600">Edit intro dan petunjuk pengisian untuk Pretest (CAAS I) dan Posttest (CAAS II).</p>
          <GameButton onClick={() => location.assign('/guru/cms-caas')} className="from-amber-500 to-amber-600">
            Buka CMS CAAS I & II
          </GameButton>
        </GameCard>
      )}
    </>
  );
}

// Komponen Pantau Aktifitas
function PantauAktifitasView({
  studentSummaries,
  studentsLoading,
  studentsError,
  greenStageColors,
  greenStageBorder,
}: {
  studentSummaries: StudentSummary[];
  studentsLoading: boolean;
  studentsError: string | null;
  greenStageColors: Record<TeacherStageId, string>;
  greenStageBorder: Record<TeacherStageId, string>;
}) {
  const STAGE_LABELS: Record<TeacherStageId, string> = {
    start: 'Start (Pretest)',
    concern: 'Concern',
    control: 'Control',
    curiosity: 'Curiosity',
    confidence: 'Confidence',
    adapt: 'Adaptabilitas Karier (Posttest)',
  };

  // Group siswa berdasarkan stage mereka
  const studentsByStage = TEACHER_STAGE_ORDER.reduce<Record<TeacherStageId, StudentSummary[]>>((acc, stage) => {
    acc[stage] = studentSummaries.filter((student) => {
      if (stage === 'start') return true; // Semua siswa di start
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

  return (
    <GameCard className="bg-white/90 border-4 border-white/70 space-y-6 text-gray-800">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Pantau Aktifitas Siswa</h2>
        <GameBadge className="bg-emerald-500/80 border-white">Monitoring Real-time</GameBadge>
      </div>

      {studentsLoading ? (
        <div className="text-center font-semibold text-gray-600 py-8">Memuat data siswa...</div>
      ) : studentsError ? (
        <div className="text-center font-semibold text-red-600 py-8">{studentsError}</div>
      ) : (
        <div className="space-y-6">
          {TEACHER_STAGE_ORDER.map((stage) => {
            const students = studentsByStage[stage];
            return (
              <div
                key={stage}
                className={`border-4 ${greenStageBorder[stage]} rounded-2xl p-4 ${greenStageColors[stage]} bg-opacity-20`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-extrabold text-gray-800">{STAGE_LABELS[stage]}</h3>
                  <GameBadge className={`${greenStageColors[stage]} text-white border-white`}>
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
                        <div className={`h-2 w-32 rounded-full ${greenStageColors[stage]} border-2 ${greenStageBorder[stage]}`} />
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
  );
}

// Komponen Tampilan Data Siswa
function DataSiswaView({
  studentSummaries,
  studentsLoading,
  studentsError,
}: {
  studentSummaries: StudentSummary[];
  studentsLoading: boolean;
  studentsError: string | null;
}) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<{ stages: Array<{ stage: string; score: number; passed: boolean; createdAt?: string | Date }>; quizzes: Array<{ isPosttest?: boolean; percent?: number; createdAt?: string | Date }>; diaries: Array<{ stage?: string; judul?: string; createdAt?: string | Date }>; evaluations: Array<{ type?: string; createdAt?: string | Date; answers?: number[] }> } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleStudentClick = async (studentId: string) => {
    if (selectedStudent === studentId) {
      setSelectedStudent(null);
      setStudentDetails(null);
      return;
    }

    setSelectedStudent(studentId);
    setLoadingDetails(true);
    try {
      // Fetch detail progress siswa
      const [stageRes, quizRes, diaryRes, evalRes] = await Promise.all([
        fetch(`/api/stage?userId=${encodeURIComponent(studentId)}`),
        fetch(`/api/quiz?userId=${encodeURIComponent(studentId)}`),
        fetch(`/api/diary?userId=${encodeURIComponent(studentId)}`),
        fetch(`/api/evaluation?userId=${encodeURIComponent(studentId)}`),
      ]);

      const stageData = stageRes.ok ? await stageRes.json() : { attempts: [] };
      const quizData = quizRes.ok ? await quizRes.json() : { results: [] };
      const diaryData = diaryRes.ok ? await diaryRes.json() : { diaries: [] };
      const evalData = evalRes.ok ? await evalRes.json() : { evaluations: [] };

      setStudentDetails({
        stages: stageData.attempts || [],
        quizzes: quizData.results || [],
        diaries: diaryData.diaries || [],
        evaluations: evalData.evaluations || [],
      });
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <GameCard className="bg-white/90 border-4 border-white/70 space-y-4 text-gray-800">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Tampilan Data Siswa</h2>
        <GameBadge className="bg-blue-500/80 border-white">Daftar Siswa</GameBadge>
      </div>

      {studentsLoading ? (
        <div className="text-center font-semibold text-gray-600 py-8">Memuat data siswa...</div>
      ) : studentsError ? (
        <div className="text-center font-semibold text-red-600 py-8">{studentsError}</div>
      ) : studentSummaries.length === 0 ? (
        <div className="text-center font-semibold text-gray-600 py-8">
          Belum ada data siswa yang tersedia.
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-auto pr-2">
          {studentSummaries.map((student) => (
            <div key={student.id} className="space-y-3">
              <div
                onClick={() => handleStudentClick(student.id)}
                className="border-2 border-white/60 bg-white/70 rounded-2xl p-4 cursor-pointer hover:bg-white/90 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-700 font-bold flex items-center justify-center">
                      {student.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email || 'Email tidak tersedia'}</p>
                      <p className="text-xs text-gray-500">{student.school || 'Sekolah belum dicatat'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500">Tahap Saat Ini</p>
                    <p className="text-sm font-bold text-emerald-600">{STAGE_META[student.highestStage].label}</p>
                    <p className="text-xs text-gray-500">Pembaruan: {formatDate(student.lastUpdated)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-3">
                  {TEACHER_STAGE_ORDER.map((stage) => (
                    <div
                      key={stage}
                      className={`h-3 flex-1 rounded-full ${
                        student.stageFlags[stage] ? STAGE_META[stage].color : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-gray-600 mt-3">
                  <span>Pretest: {student.prePercent}%</span>
                  <span>Posttest: {student.postPercent}%</span>
                  <span>
                    Stage Selesai: {TEACHER_STAGE_ORDER.filter((s) => student.stageFlags[s]).length}/
                    {TEACHER_STAGE_ORDER.length}
                  </span>
                  <span>
                    Adaptabilitas: {student.stageFlags.adapt ? 'Refleksi tersimpan' : 'Belum ada catatan'}
                  </span>
                </div>
              </div>

              {/* Detail Progress Siswa */}
              {selectedStudent === student.id && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 space-y-4">
                  {loadingDetails ? (
                    <div className="text-center font-semibold text-gray-600">Memuat detail progress...</div>
                  ) : studentDetails ? (
                    <div className="space-y-4">
                      <h4 className="font-bold text-lg text-gray-800">Detail Progress</h4>
                      
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Stage Attempts ({studentDetails.stages.length})</h5>
                        <div className="space-y-2 max-h-40 overflow-auto">
                          {studentDetails.stages.slice(0, 5).map((attempt: { stage: string; score: number; passed: boolean; createdAt?: string | Date }, idx: number) => (
                            <div key={idx} className="bg-white rounded p-2 text-xs">
                              <span className="font-semibold">{attempt.stage}:</span> Score {attempt.score}, 
                              {attempt.passed ? ' Lulus ✅' : ' Belum Lulus ⚠️'} - {formatDate(attempt.createdAt)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Quiz Results ({studentDetails.quizzes.length})</h5>
                        <div className="space-y-2 max-h-40 overflow-auto">
                          {studentDetails.quizzes.slice(0, 5).map((quiz: { isPosttest?: boolean; percent?: number; createdAt?: string | Date }, idx: number) => (
                            <div key={idx} className="bg-white rounded p-2 text-xs">
                              {quiz.isPosttest ? 'Posttest' : 'Pretest'}: {quiz.percent}% - {formatDate(quiz.createdAt)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Diaries ({studentDetails.diaries.length})</h5>
                        <div className="space-y-2 max-h-40 overflow-auto">
                          {studentDetails.diaries.slice(0, 5).map((diary: { stage?: string; judul?: string; createdAt?: string | Date }, idx: number) => (
                            <div key={idx} className="bg-white rounded p-2 text-xs">
                              {diary.stage || 'Unknown'}: {diary.judul || 'No title'} - {formatDate(diary.createdAt)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center font-semibold text-gray-600">Tidak ada data detail</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </GameCard>
  );
}

// Komponen CMS Intro
function CMSIntroView() {
  const [selectedStage, setSelectedStage] = useState<WeightedStageId>('concern');
  const [slides, setSlides] = useState<Array<{ key: string; title: string; paragraphs: string[] }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadIntroSlides();
  }, [selectedStage]);

  const loadIntroSlides = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Load from CMS API first, fallback to default
      const res = await fetch(`/api/cms/intro?stage=${selectedStage}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setSlides(data.data);
        } else {
          // Fallback to default from stageContent
          const defaultSlides = weightedIntroSlides[selectedStage];
          setSlides(defaultSlides.map(s => ({ ...s })));
        }
      } else {
        // Fallback to default
        const defaultSlides = weightedIntroSlides[selectedStage];
        setSlides(defaultSlides.map(s => ({ ...s })));
      }
    } catch (error) {
      console.error('Error loading intro slides:', error);
      // Fallback to default
      const defaultSlides = weightedIntroSlides[selectedStage];
      setSlides(defaultSlides.map(s => ({ ...s })));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/cms/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: selectedStage, slides }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Intro slides berhasil disimpan!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(`Error: ${data.error || 'Gagal menyimpan'}`);
      }
    } catch (error) {
      console.error('Error saving intro slides:', error);
      setMessage('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const updateSlide = (index: number, field: 'title' | 'paragraphs', value: string | string[]) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const addSlide = () => {
    setSlides([...slides, { key: `new-${Date.now()}`, title: '', paragraphs: [''] }]);
  };

  const removeSlide = (index: number) => {
    if (confirm('Hapus slide ini?')) {
      setSlides(slides.filter((_, i) => i !== index));
    }
  };

  return (
    <GameCard className="bg-white/90 border-4 border-white/70 space-y-4 text-gray-800">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">CMS Edit Intro</h2>
        <GameBadge className="bg-purple-500/80 border-white">Content Management</GameBadge>
      </div>

      <div className="flex gap-2 mb-4">
        {weightedStageOrder.map((stage) => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedStage === stage
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Memuat data...</div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-auto pr-2">
          {slides.map((slide, slideIndex) => (
            <div key={slideIndex} className="border-2 border-gray-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Slide {slideIndex + 1}</h3>
                <button
                  onClick={() => removeSlide(slideIndex)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Hapus
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Judul</label>
                <input
                  type="text"
                  value={slide.title || ''}
                  onChange={(e) => updateSlide(slideIndex, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Paragraf (satu per baris)</label>
                <textarea
                  value={Array.isArray(slide.paragraphs) ? slide.paragraphs.join('\n') : slide.paragraphs || ''}
                  onChange={(e) => {
                    const paragraphs = e.target.value.split('\n').filter(p => p.trim());
                    updateSlide(slideIndex, 'paragraphs', paragraphs);
                  }}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addSlide}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            + Tambah Slide
          </button>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <GameButton onClick={handleSave} disabled={saving} className="from-green-500 to-emerald-600">
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </GameButton>
        <GameButton onClick={loadIntroSlides} className="from-gray-400 to-gray-600">
          Reset
        </GameButton>
      </div>
    </GameCard>
  );
}

// Komponen CMS Quiz
function CMSQuizView() {
  const [selectedStage, setSelectedStage] = useState<WeightedStageId>('concern');
  const [questions, setQuestions] = useState<Array<{ q: string; options: Array<{ text: string; score: number }> }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadQuizQuestions();
  }, [selectedStage]);

  const loadQuizQuestions = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Load from CMS API first, fallback to default
      const res = await fetch(`/api/cms/quiz?stage=${selectedStage}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setQuestions(data.data);
        } else {
          // Fallback to default from stageContent
          const defaultQuestions = weightedAssessment[selectedStage];
          setQuestions(defaultQuestions.map(q => ({ ...q })));
        }
      } else {
        // Fallback to default
        const defaultQuestions = weightedAssessment[selectedStage];
        setQuestions(defaultQuestions.map(q => ({ ...q })));
      }
    } catch (error) {
      console.error('Error loading quiz questions:', error);
      // Fallback to default
      const defaultQuestions = weightedAssessment[selectedStage];
      setQuestions(defaultQuestions.map(q => ({ ...q })));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/cms/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: selectedStage, questions }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Quiz questions berhasil disimpan!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(`Error: ${data.error || 'Gagal menyimpan'}`);
      }
    } catch (error) {
      console.error('Error saving quiz questions:', error);
      setMessage('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (qIndex: number, field: 'q' | 'options', value: string | Array<{ text: string; score: number }>) => {
    const newQuestions = [...questions];
    newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, optIndex: number, field: 'text' | 'score', value: string | number) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        q: '',
        options: [
          { text: '', score: 10 },
          { text: '', score: 20 },
          { text: '', score: 30 },
          { text: '', score: 40 },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (confirm('Hapus pertanyaan ini?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  return (
    <GameCard className="bg-white/90 border-4 border-white/70 space-y-4 text-gray-800">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">CMS Edit Quiz</h2>
        <GameBadge className="bg-orange-500/80 border-white">Content Management</GameBadge>
      </div>

      <div className="flex gap-2 mb-4">
        {weightedStageOrder.map((stage) => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              selectedStage === stage
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Memuat data...</div>
      ) : (
        <div className="space-y-4 max-h-[600px] overflow-auto pr-2">
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="border-2 border-gray-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Pertanyaan {qIndex + 1}</h3>
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Hapus
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Pertanyaan</label>
                <input
                  type="text"
                  value={question.q || ''}
                  onChange={(e) => updateQuestion(qIndex, 'q', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Pilihan Jawaban</label>
                {question.options?.map((option: { text: string; score: number }, optIndex: number) => (
                  <div key={optIndex} className="mb-2 flex gap-2">
                    <input
                      type="text"
                      value={option.text || ''}
                      onChange={(e) => updateOption(qIndex, optIndex, 'text', e.target.value)}
                      placeholder={`Jawaban ${String.fromCharCode(65 + optIndex)}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="number"
                      value={option.score || 0}
                      onChange={(e) => updateOption(qIndex, optIndex, 'score', parseInt(e.target.value) || 0)}
                      placeholder="Score"
                      className="w-20 px-3 py-2 border border-gray-300 rounded"
                      min="0"
                      max="40"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            onClick={addQuestion}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            + Tambah Pertanyaan
          </button>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <GameButton onClick={handleSave} disabled={saving} className="from-green-500 to-emerald-600">
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </GameButton>
        <GameButton onClick={loadQuizQuestions} className="from-gray-400 to-gray-600">
          Reset
        </GameButton>
      </div>
    </GameCard>
  );
}

function Field({
  label,
  value,
  span = false,
}: {
  label: string;
  value?: string | number | null;
  span?: boolean;
}) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <p className="text-xs text-gray-500 mb-1 uppercase font-bold">{label}</p>
      <div className="px-3 py-2 bg-white/70 rounded-xl border border-white/60 text-gray-800">
        {value || '-'}
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number | undefined;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border-2 border-white/60 bg-white/60 p-3">
      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white ${accent}`}>
        {label}
      </div>
      <p className="text-2xl font-black text-gray-800 mt-2">{value ?? '-'}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}


