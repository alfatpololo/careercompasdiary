'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameButton, LoadingSpinner } from '../../../components/GameUI';

const questions = [
  'Saya mampu menggunakan website Career Compass Diary',
  'Saya dapat memahami bagaimana fitur-fitur Career Compass Diary mendukung proses bimbingan karier',
  'Saya menunjukkan pemahaman dalam penggunaan website',
  'Saya memahami pentingnya menumbuhkan adaptabilitas karier',
  'Saya menunjukkan antusias dan positif dalam mengembangkan keterampilan adaptabilitas karier saya'
];

function EvaluationResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<number[]>([]);
  const isPosttest = searchParams?.get('posttest') === 'true';

  const handleAnswer = (index: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.length !== questions.length) {
      alert('Silakan jawab semua pertanyaan');
      return;
    }

    if (!user?.uid) {
      alert('User ID tidak ditemukan. Silakan login ulang.');
      return;
    }

    try {
      console.log('[Evaluation Result] Submitting evaluation...');
      const response = await fetch('/api/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          type: 'result',
          answers
        })
      });

      const evalData = await response.json();
      console.log('[Evaluation Result] Evaluation API response:', evalData);

      if (!response.ok) {
        alert(`Gagal menyimpan evaluasi: ${evalData.error || 'Unknown error'}`);
        return;
      }

      // Jika ini posttest, langsung redirect ke hasil posttest
      if (isPosttest) {
        console.log('[Evaluation Result] Posttest evaluation completed, redirecting to posttest results');
        router.push('/results/prepost?view=posttest');
        return;
      }

      // Tandai START selesai pada progress user agar Concern terbuka di Journey (hanya untuk pretest)
      console.log('[Evaluation Result] Saving START progress...');
      try {
        // START tidak butuh skor, hanya completion
        const progressRes = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid,
            levelId: 'start',
            score: 0, // START tidak butuh skor
            completed: true
          })
        });
        
        const progressResData = await progressRes.json();
        console.log('[Evaluation Result] Progress API response:', progressResData);
        
        if (!progressRes.ok) {
          console.error('[Evaluation Result] ❌ Progress update failed:', {
            status: progressRes.status,
            error: progressResData.error
          });
          alert(`⚠️ Evaluasi tersimpan, tapi progress gagal diupdate: ${progressResData.error || 'Unknown error'}\n\nSilakan refresh halaman Journey setelah ini.`);
          router.push('/congratulations');
          return;
        }
        
        console.log('[Evaluation Result] ✅ Progress START saved successfully:', {
          response: progressResData,
          savedProgress: progressResData?.data?.progress || []
        });
        
        // Verify the save - double check dengan delay kecil untuk memastikan write sudah commit
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const verifyRes = await fetch(`/api/progress?userId=${encodeURIComponent(user.uid)}`);
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          const verifyArr = verifyData?.data?.progress;

          type ProgressRecord = { levelId?: string; completed?: boolean };
          const startFound =
            Array.isArray(verifyArr) &&
            verifyArr.some((entry): entry is ProgressRecord => {
              if (!entry || typeof entry !== 'object') {
                return false;
              }
              const record = entry as { levelId?: unknown; completed?: unknown };
              return record.levelId === 'start' && record.completed === true;
            });

          console.log('[Evaluation Result] ✅ Verification - START found in progress:', startFound, verifyArr);
          
          if (!startFound) {
            console.warn('[Evaluation Result] ⚠️ WARNING: START progress not found in verification!');
            alert('⚠️ Progress mungkin belum tersimpan dengan benar. Silakan refresh halaman Journey.');
          }
        }
        
        // Redirect ke congratulations page
        router.push('/congratulations');
      } catch (e) {
        console.error('[Evaluation Result] ❌ Exception saving progress:', e);
        alert(`⚠️ Evaluasi tersimpan, tapi ada error saat update progress.\n\nError: ${e instanceof Error ? e.message : 'Unknown error'}\n\nSilakan refresh halaman Journey setelah ini.`);
        router.push('/congratulations');
      }
    } catch (error) {
      console.error('[Evaluation Result] ❌ Error:', error);
      alert(`Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!user) {
    return <div>Login required</div>;
  }

  return (
    <div className="min-h-screen p-4" style={{
      backgroundImage: 'url(/Background_Mulai.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <div className="max-w-6xl mx-auto mt-16">
        <GameCard>
          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT PANEL */}
            <div>
              <h2 className="text-3xl font-extrabold text-white drop-shadow mb-4">Evaluasi Hasil</h2>
              <div className="space-y-2 text-white/95 font-semibold">
                <p>Petunjuk:</p>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>Bacalah secara teliti.</li>
                  <li>Berilah tanda centang (√) pada kolom jawaban yang tersedia.</li>
                  <li>Skala: 3 = Sangat Setuju, 2 = Setuju, 1 = Tidak Setuju.</li>
                </ul>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="max-h-[65vh] overflow-auto pr-2">
              <table className="w-full text-white/95">
                <thead>
                  <tr className="bg-white/20">
                    <th className="border-4 border-white/60 p-2 text-left">No</th>
                    <th className="border-4 border-white/60 p-2 text-left">Aspek yang Dinilai</th>
                    <th className="border-4 border-white/60 p-2 text-center">1</th>
                    <th className="border-4 border-white/60 p-2 text-center">2</th>
                    <th className="border-4 border-white/60 p-2 text-center">3</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, index) => (
                    <tr key={index} className="bg-white/10">
                      <td className="border-4 border-white/60 p-2 text-center font-extrabold">{index + 1}</td>
                      <td className="border-4 border-white/60 p-2 text-sm">{question}</td>
                      <td className="border-4 border-white/60 p-2 text-center">
                        <input
                          type="radio"
                          name={`q${index}`}
                          checked={answers[index] === 1}
                          onChange={() => handleAnswer(index, 1)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="border-4 border-white/60 p-2 text-center">
                        <input
                          type="radio"
                          name={`q${index}`}
                          checked={answers[index] === 2}
                          onChange={() => handleAnswer(index, 2)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="border-4 border-white/60 p-2 text-center">
                        <input
                          type="radio"
                          name={`q${index}`}
                          checked={answers[index] === 3}
                          onChange={() => handleAnswer(index, 3)}
                          className="cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>
          
          {/* Buttons - outside grid, consistent position */}
          <div className="flex justify-between mt-6 pt-4 border-t-2 border-white/30">
            <GameButton onClick={() => router.back()} className="from-gray-400 to-gray-600">Cancel</GameButton>
            <GameButton onClick={handleSubmit} className="from-green-400 to-green-600">Submit</GameButton>
          </div>
        </GameCard>
      </div>
    </div>
  );
}

export default function EvaluationResult() {
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
      <EvaluationResultContent />
    </Suspense>
  );
}

