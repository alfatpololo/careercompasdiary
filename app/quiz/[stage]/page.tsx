'use client';

import { useRouter } from 'next/navigation';
import { use, useState, useEffect } from 'react';
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

  // VALIDASI SEQUENTIAL UNLOCK - jika mode assessment, cek unlock status
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(isAssessment ? null : true);
  
  useEffect(() => {
    if (!isAssessment || !user) return;
    
    const checkUnlock = async () => {
      try {
        // Fetch latest pass status
        const stageRes = await fetch(`/api/stage?userId=${encodeURIComponent(user.uid)}`);
        if (stageRes.ok) {
          const stageData = await stageRes.json();
          const latest = stageData.latest || {};
          
          // Fetch start progress
          const progRes = await fetch(`/api/progress?userId=${encodeURIComponent(user.uid)}`);
          let startDone = false;
          if (progRes.ok) {
            const progData = await progRes.json();
            const progArr = progData?.data?.progress || [];
            startDone = progArr.find((p: { levelId: string; completed: boolean }) => p.levelId === 'start' && p.completed === true) !== undefined;
          }
          
          // Check unlock berdasarkan stage - SEQUENTIAL KETAT
          let shouldUnlock = false;
          if (stageKey === 'concern') {
            shouldUnlock = startDone === true; // CONCERN hanya unlock jika START selesai
          } else if (stageKey === 'control') {
            shouldUnlock = latest['concern']?.passed === true; // CONTROL hanya jika CONCERN passed
          } else if (stageKey === 'curiosity') {
            shouldUnlock = latest['control']?.passed === true; // CURIOSITY hanya jika CONTROL passed
          } else if (stageKey === 'confidence') {
            shouldUnlock = latest['curiosity']?.passed === true; // CONFIDENCE hanya jika CURIOSITY passed
          }
          
          console.log(`[Quiz Page] 🔒 Unlock validation for ${stageKey}:`, {
            shouldUnlock,
            startDone,
            latest,
            stageKey
          });
          
          if (!shouldUnlock) {
            alert(`Stage ${stageKey} masih terkunci. Selesaikan stage sebelumnya terlebih dahulu.`);
            router.push('/journey');
            setIsUnlocked(false);
            return;
          }
          
          setIsUnlocked(true);
        }
      } catch (e) {
        console.error('[Quiz Page] Failed to check unlock:', e);
        router.push('/journey');
        setIsUnlocked(false);
      }
    };
    
    checkUnlock();
  }, [isAssessment, stageKey, user, router]);

  if (isAssessment) {
    if (isUnlocked === false || isUnlocked === null) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{
          backgroundImage: 'url(/Background_Mulai.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
          <div className="bg-white bg-opacity-90 rounded-lg p-8 text-center">
            <div className="text-white">Memeriksa akses...</div>
          </div>
        </div>
      );
    }
    
    return <AssessmentComponent stage={stageKey} />;
  }
  
  return <QuizComponent initialStage={stageKey} showIntroDefault={showIntro} />;
}
