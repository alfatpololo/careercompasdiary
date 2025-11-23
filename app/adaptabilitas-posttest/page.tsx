'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { QuizComponent } from '../quiz/[stage]/quiz';
import { LoadingSpinner } from '../../components/GameUI';

export default function AdaptabilitasPosttest() {
  const router = useRouter();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [allStagesCompleted, setAllStagesCompleted] = useState(false);

  // Cek apakah semua stage sudah selesai dan apakah posttest sudah ada
  useEffect(() => {
    if (!user) return;

    const checkStagesCompletion = async () => {
      try {
        // Fetch stage data untuk cek apakah semua stage sudah passed
        const stageRes = await fetch(`/api/stage?userId=${encodeURIComponent(user.uid)}`);
        if (stageRes.ok) {
          const stageData = await stageRes.json();
          const latest = stageData.latest || {};
          
          // Cek apakah semua stage (concern, control, curiosity, confidence) sudah passed
          const requiredStages = ['concern', 'control', 'curiosity', 'confidence'];
          const allCompleted = requiredStages.every(
            stage => latest[stage]?.passed === true
          );
          
          if (!allCompleted) {
            console.log('[Posttest] Not all stages completed, redirecting to journey');
            router.push('/journey');
            return;
          }
          
          // Cek apakah posttest sudah ada
          const quizRes = await fetch(`/api/quiz?userId=${encodeURIComponent(user.uid)}`);
          if (quizRes.ok) {
            const quizData = await quizRes.json();
            const results = quizData.results || [];
            
            // Cari posttest (isPosttest === true)
            const hasPosttest = results.some((result: { isPosttest?: boolean }) => result.isPosttest === true);
            
            if (hasPosttest) {
              console.log('[Posttest] Posttest already completed, redirecting to results');
              router.push('/results/prepost?view=posttest');
              return;
            }
          }
          
          setAllStagesCompleted(true);
        } else {
          console.error('[Posttest] Failed to fetch stage data');
          router.push('/journey');
        }
      } catch (error) {
        console.error('[Posttest] Error checking stages completion:', error);
        router.push('/journey');
      } finally {
        setChecking(false);
      }
    };

    checkStagesCompletion();
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="bg-white bg-opacity-90 rounded-lg p-8 text-center">
          <p className="text-gray-800 mb-4">Anda harus login terlebih dahulu</p>
          <button onClick={() => router.push('/login')} className="bg-blue-500 text-white px-6 py-2 rounded">
            Login
          </button>
        </div>
      </div>
    );
  }

  // Jika sedang mengecek, tampilkan loading
  if (checking) {
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

  // Jika semua stage belum selesai, tidak render (akan redirect)
  if (!allStagesCompleted) {
    return null;
  }

  // Gunakan QuizComponent untuk POSTTEST - quiz adaptabilitas karier setelah semua stage
  return <QuizComponent initialStage="concern" showIntroDefault={true} isPosttest={true} />;
}

