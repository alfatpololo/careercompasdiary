'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { QuizComponent, AssessmentComponent } from './quiz';

type StageKey = 'concern' | 'control' | 'curiosity' | 'confidence';
export default function QuizPage({ params, searchParams }: { params: Promise<{ stage: string }>, searchParams: Promise<{ [key: string]: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const { stage } = use(params);
  const query = use(searchParams);
  const showIntro = query?.intro === '1';
  const isAssessment = query?.mode === 'assessment';

  if (!user) {
    return (
      <div 
        className="min-h-screen w-full relative flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Mulai.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="bg-white bg-opacity-90 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 backdrop-blur-sm text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">Anda harus login terlebih dahulu</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const allowed: readonly StageKey[] = ['concern','control','curiosity','confidence'] as const;
  const stageKey: StageKey = allowed.includes(stage as StageKey) ? (stage as StageKey) : 'concern';

  if (isAssessment) {
    return <AssessmentComponent stage={stageKey} />;
  }
  return <QuizComponent initialStage={stageKey} showIntroDefault={showIntro} />;
}
