'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameButton } from '../../../components/GameUI';

const defaultQuestions = [
  'Saya memahami pentingnya memiliki kendali diri dalam mengelola dan mengarahkan jalur karier saya.',
  'Saya dapat menjelaskan kembali materi tentang kendali diri (Control) yang telah dipelajari selama kegiatan layanan.',
  'Saya mampu menerapkan sikap kemandirian, tanggung jawab, dan disiplin dalam menentukan arah karier saya.',
  'Saya dapat menjawab soal-soal gamifikasi dengan baik karena memahami materi yang diberikan.',
  'Saya merasa layanan ini membantu saya meningkatkan pemahaman dan kesadaran akan pentingnya kendali diri dalam perencanaan karier.',
];

export default function ControlEvaluationResultStudent() {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<string[]>(defaultQuestions);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/cms/evaluation?stage=control');
        const data = await res.json();
        if (data.success && data.data?.result?.length) {
          setQuestions(data.data.result);
          setAnswers([]);
        }
      } catch (err) {
        console.error('Error loading evaluation questions:', err);
      }
    };
    load();
  }, []);

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
      alert('User tidak ditemukan. Silakan login ulang.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          type: 'control_student_result',
          answers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data?.message || 'Gagal menyimpan evaluasi hasil.');
        return;
      }

      alert('Evaluasi hasil berhasil disimpan! ✅');
      router.push('/journey');
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menyimpan evaluasi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundImage: 'url(/Background_Mulai.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Diperlukan</h2>
          <p className="text-gray-600 mb-6">Silakan login terlebih dahulu untuk mengisi evaluasi hasil.</p>
          <GameButton onClick={() => router.push('/login')} className="from-blue-500 to-blue-700">Login</GameButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundImage: 'url(/Background_Mulai.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="max-w-6xl mx-auto mt-16">
        <GameCard>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-3xl font-extrabold text-white drop-shadow mb-4">Evaluasi Hasil - Control</h2>
              <div className="space-y-2 text-white/95 font-semibold">
                <p>Petunjuk:</p>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>Bacalah secara teliti.</li>
                  <li>Berilah tanda centang (√) pada kolom jawaban yang tersedia.</li>
                  <li>Skala: 3 = Sangat Setuju, 2 = Setuju, 1 = Tidak Setuju.</li>
                </ul>
              </div>
            </div>
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
                        <input type="radio" name={`q${index}`} checked={answers[index] === 1} onChange={() => handleAnswer(index, 1)} className="cursor-pointer" />
                      </td>
                      <td className="border-4 border-white/60 p-2 text-center">
                        <input type="radio" name={`q${index}`} checked={answers[index] === 2} onChange={() => handleAnswer(index, 2)} className="cursor-pointer" />
                      </td>
                      <td className="border-4 border-white/60 p-2 text-center">
                        <input type="radio" name={`q${index}`} checked={answers[index] === 3} onChange={() => handleAnswer(index, 3)} className="cursor-pointer" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-between mt-6 pt-4 border-t-2 border-white/30">
            <GameButton onClick={() => router.push('/control')} className="from-gray-400 to-gray-600">Cancel</GameButton>
            <GameButton onClick={handleSubmit} disabled={submitting} className="from-green-400 to-green-600">{submitting ? 'Menyimpan...' : 'Submit'}</GameButton>
          </div>
        </GameCard>
      </div>
    </div>
  );
}
