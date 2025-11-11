'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameButton, GameBadge } from '../../../components/GameUI';

const questions = [
  'Saya memperhatikan dengan baik penjelasan guru BK tentang pentingnya percaya diri dalam menghadapi tantangan karier.',
  'Saya aktif mengikuti kegiatan layanan yang membahas materi kepercayaan diri (Confidence).',
  'Saya berpartisipasi dengan percaya diri dalam kegiatan diskusi atau tugas yang diberikan selama layanan berlangsung.',
  'Saya berusaha menjawab soal-soal gamifikasi dengan sungguh-sungguh untuk memahami materi yang disampaikan.',
  'Saya merasa proses kegiatan layanan membantu saya lebih memahami pentingnya memiliki sikap percaya diri terhadap karier masa depan.',
];

const instructions = [
  'Bacalah secara teliti.',
  'Berilah tanda centang (√) pada kolom jawaban yang tersedia.',
  'Pilihan jawaban: 1 = Tidak Setuju, 2 = Setuju, 3 = Sangat Setuju.',
  'Interpretasi skor:',
  '• 5–7 : Perlu intervensi atau pendampingan lebih intens (rendah)',
  '• 8–11 : Perlu penguatan (sedang)',
  '• 12–15 : Sudah baik dan mandiri pada tahap Confidence (tinggi)',
];

export default function ConfidenceEvaluationProcessStudent() {
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
      alert('Silakan isi seluruh pernyataan evaluasi proses terlebih dahulu.');
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
          type: 'confidence_student_process',
          answers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data?.message || 'Gagal menyimpan evaluasi proses.');
        return;
      }

      alert('Evaluasi proses siswa tahap Confidence berhasil disimpan! ✅');
      router.push('/confidence/evaluation-result-student');
    } catch (error) {
      console.error('[Confidence Evaluation Student Process] Error:', error);
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
            Silakan login terlebih dahulu untuk mengisi evaluasi proses tahap Confidence.
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
            <GameBadge className="bg-orange-500/80 border-white">Siswa</GameBadge>
            <h1 className="text-3xl font-extrabold drop-shadow mt-2">Evaluasi Proses Tahap Confidence</h1>
            <p className="text-white/85 font-semibold max-w-2xl">
              Nilai pengalamanmu selama mengikuti layanan Confidence untuk membantu guru memahami kebutuhanmu.
            </p>
          </div>
          <GameButton onClick={() => router.push('/confidence')} className="from-gray-400 to-gray-600">
            Menu Confidence
          </GameButton>
        </div>

        <GameCard className="bg-gradient-to-br from-orange-400 to-red-500">
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

            <div className="flex justify_between">
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


