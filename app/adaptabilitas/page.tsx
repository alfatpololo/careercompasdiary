'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { QuizComponent } from '../quiz/[stage]/quiz';
import { LoadingSpinner } from '../../components/GameUI';

export default function AdaptabilitasCareer() {
  const router = useRouter();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);

  // Cek apakah user sudah pernah mengisi quiz pembuka
  useEffect(() => {
    if (!user) return;

    const checkQuizCompletion = async () => {
      try {
        const response = await fetch(`/api/quiz?userId=${encodeURIComponent(user.uid)}`);
        if (response.ok) {
          const data = await response.json();
          const results = data.results || [];
          
          // Jika ada hasil quiz, berarti sudah pernah mengisi
          if (results.length > 0) {
            console.log('[Adaptabilitas] User sudah pernah mengisi quiz pembuka, redirect ke intro');
            setHasCompletedQuiz(true);
            router.push('/adaptabilitas-intro');
            return;
          }
        }
        setHasCompletedQuiz(false);
      } catch (error) {
        console.error('[Adaptabilitas] Error checking quiz completion:', error);
        setHasCompletedQuiz(false);
      } finally {
        setChecking(false);
      }
    };

    checkQuizCompletion();
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

  // Jika sudah pernah mengisi quiz, tidak perlu render QuizComponent (akan redirect)
  if (hasCompletedQuiz) {
    return null;
  }

  // Gunakan QuizComponent untuk START - quiz pengenalan Concern sampai Confidence
  return <QuizComponent initialStage="concern" showIntroDefault={true} />;
}
