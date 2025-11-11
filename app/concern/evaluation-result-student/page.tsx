'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameButton, GameBadge } from '../../../components/GameUI';

const questions = [
  'Saya memahami pentingnya memiliki kepedulian terhadap karier masa depan saya.',
  'Saya dapat menjelaskan kembali materi tentang kepedulian terhadap karier (Concern) dengan baik.',
  'Setelah mengikuti layanan ini, saya lebih sadar bahwa perencanaan karier perlu dilakukan sejak dini.',
  'Saya dapat menjawab soal-soal gamifikasi yang diberikan dengan baik karena memahami materi yang disampaikan.',
  'Layanan ini membantu saya untuk lebih peduli dan termotivasi dalam merencanakan karier masa depan saya.',
];

const instructions = [
  'Bacalah secara teliti.',
  'Berilah tanda centang (√) pada kolom jawaban yang tersedia.',
  'Pilihan jawaban: 1 = Tidak Setuju, 2 = Setuju, 3 = Sangat Setuju.',
  'Interpretasi skor:',
  '• 5–7 : Perlu intervensi atau pendampingan lebih intens (rendah)',
  '• 8–11 : Perlu penguatan (sedang)',
  '• 12–15 : Sudah baik dan mandiri pada tahap Concern (tinggi)',
];

export default function ConcernEvaluationResultStudent() {
  const router = useRouter();
  const { user } = useAuth();
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(0));
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = (index: number, value: number) => {
    const copy = [...answers];
    copy[index] = value;
    setAnswers(copy);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (answers.some((value) => value === 0)) {
      alert('Silakan isi seluruh pernyataan evaluasi hasil terlebih dahulu.');
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
          type: 'concern_student_result',
          answers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data?.message || 'Gagal menyimpan evaluasi hasil.');
        return;
      }

      alert('Evaluasi hasil siswa berhasil disimpan! ✅');
      router.push('/concern');
    } catch (error) {
      console.error('[Concern Evaluation Student Result] Error:', error);
      alert('Terjadi kesalahan saat menyimpan evaluasi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Mulai.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="bg-white bg-opacity-95 rounded-xl shadow-2xl p-8 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Diperlukan</h2>
          <p className="text-gray-600">
            Silakan login terlebih dahulu untuk mengisi evaluasi hasil tahap Concern.
          </p>
          <GameButton onClick={() => router.push('/login')} className="mt-6 from-blue-500 to-blue-700">
            Login
          </GameButton>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between text-white">
          <div>
            <GameBadge className="bg-green-500/80 border-white">Siswa</GameBadge>
            <h1 className="text-3xl font-extrabold drop-shadow mt-2">Evaluasi Hasil Tahap Concern</h1>
            <p className="text-white/85 font-semibold max-w-2xl">
              Catat dampak pembelajaran dan pemahamanmu setelah menyelesaikan tahap Concern.
            </p>
          </div>
          <GameButton onClick={() => router.push('/concern')} className="from-gray-400 to-gray-600">
            Menu Concern
          </GameButton>
        </div>

        <GameCard className="bg-gradient-to-br from-emerald-400 to-teal-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white/15 rounded-2xl border-2 border-white/30 p-4 text-white/90 font-semibold">
              <h2 className="text-xl font-extrabold mb-2">Petunjuk</h2>
              <ul className="list-disc ml-6 space-y-1">
                {instructions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="max-h-[60vh] overflow-auto pr-2">
              <table className="w-full text-white/95 text-sm">
                <thead>
                  <tr className="bg-white/20">
                    <th className="border-4 border-white/60 p-2 w-12 text-center">No</th>
                    <th className="border-4 border-white/60 p-2 text-left">Pernyataan</th>
                    <th className="border-4 border-white/60 p-2 text-center w-16">1</th>
                    <th className="border-4 border-white/60 p-2 text-center w-16">2</th>
                    <th className="border-4 border-white/60 p-2 text-center w-16">3</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, index) => (
                    <tr key={index} className="bg-white/10">
                      <td className="border-4 border-white/60 p-2 text-center font-extrabold">{index + 1}</td>
                      <td className="border-4 border-white/60 p-2">{question}</td>
                      {[1, 2, 3].map((value) => (
                        <td key={value} className="border-4 border-white/60 p-2 text-center">
                          <input
                            type="radio"
                            name={`q${index}`}
                            checked={answers[index] === value}
                            onChange={() => handleAnswer(index, value)}
                            className="cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between">
              <GameButton type="button" onClick={() => router.back()} className="from-gray-400 to-gray-600">
                Cancel
              </GameButton>
              <GameButton type="submit" className="from-yellow-300 to-orange-400" disabled={submitting}>
                {submitting ? 'Menyimpan...' : 'Simpan Evaluasi'}
              </GameButton>
            </div>
          </form>
        </GameCard>
      </div>
    </div>
  );
}


