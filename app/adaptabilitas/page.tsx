'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { QuizComponent } from '../quiz/[stage]/quiz';

export default function AdaptabilitasCareer() {
  const router = useRouter();
  const { user } = useAuth();

  // Check if START already completed - skip quiz jika sudah pernah isi
  useEffect(() => {
    if (!user) {
      return;
    }

    const checkStartProgress = async () => {
      try {
        const prog = await fetch(`/api/progress?userId=${encodeURIComponent(user.uid)}`);
        if (prog.ok) {
          const pdata = await prog.json();
          const progArr: Array<{ levelId: string; completed: boolean }> = pdata?.data?.progress || [];
          const startItem = progArr.find((p) => p.levelId === 'start' && p.completed === true);
          const isStartDone = !!startItem;
          
          console.log('[START] Progress check:', {
            found: !!startItem,
            isStartDone
          });
          
          // Jika START sudah selesai, redirect ke journey
          if (isStartDone) {
            console.log('[START] Already completed, redirecting to journey');
            router.push('/journey?refresh=true');
            return;
          }
        }
      } catch (e) {
        console.error('[START] Failed to check progress:', e);
      }
    };

    checkStartProgress();
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

  // Gunakan QuizComponent untuk START - quiz pengenalan Concern sampai Confidence
  return <QuizComponent initialStage="concern" showIntroDefault={true} />;
}
