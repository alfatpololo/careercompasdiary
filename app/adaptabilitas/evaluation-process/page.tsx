'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameButton, LoadingSpinner } from '../../../components/GameUI';

const questions = [
  'Saya memahami langkah-langkah penggunaan website Career Compass Diary',
  'Penjelasan tentang fitur-fitur website Career Compass Diary disampaikan dengan jelas dan mudah dimengerti.',
  'Saya merasa mampu mengoperasikan website Career Compass Diary secara mandiri pada kegiatan bimbingan karier',
  'Saya memahami pentingnya menumbuhkan adaptabilitas karier bagi siswa di era modern',
  'Kegiatan ini membantu saya merencanakan langkah awal untuk mengembangkan keterampilan adaptabilitas karier saya'
];

function EvaluationProcessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isPosttest = searchParams?.get('posttest') === 'true';
  const [answers, setAnswers] = useState<number[]>([]);

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

    try {
      const response = await fetch('/api/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          type: 'process',
          answers
        })
      });

      if (response.ok) {
        // Redirect ke evaluation-result dengan query parameter posttest jika ini posttest
        if (isPosttest) {
          router.push('/adaptabilitas/evaluation-result?posttest=true');
        } else {
          router.push('/adaptabilitas/evaluation-result');
        }
      }
    } catch (error) {
      console.error('Error:', error);
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
              <h2 className="text-3xl font-extrabold text-white drop-shadow mb-4">Evaluasi Proses</h2>
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

export default function EvaluationProcess() {
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
      <EvaluationProcessContent />
    </Suspense>
  );
}
