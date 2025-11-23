'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { GameCard, GameButton, LoadingSpinner } from '../../../../components/GameUI';

// Evaluation questions for each stage
const EVALUATION_QUESTIONS: Record<string, {
  process: string[];
  result: string[];
}> = {
  start: {
    process: [
      'Siswa menunjukkan sikap aktif dalam proses bimbingan karier',
      'Siswa memahami aturan permainan yang ada dalam website',
      'Siswa mampu mengaplikasikan website dengan baik',
      'Siswa menunjukkan sikap antusias dalam mengikuti sesi pelaksanaan bimbingan',
      'Siswa mampu mengambarkan ketercapaian pemahaman karier'
    ],
    result: [
      'Saya memahami tujuan layanan dengan baik',
      'Saya memahami topik yang akan disajikan dalam bimbingan karier',
      'Saya merasa nyaman dengan anggota kelompok',
      'Saya bersedia mengikuti sesi berikutnya dengan antusias',
      'Saya mampu mengembangkan pemahaman kelompok akan karier'
    ]
  },
  concern: {
    process: [
      'Siswa menunjukkan sikap aktif dalam proses permainan game',
      'Siswa memahami aturan permainan yang ada dalam website career compass diary',
      'Siswa menunjukkan sikap positif terhadap kepedulian akan karier',
      'Siswa menunjukkan pemahaman materi kepedulian akan karier',
      'Siswa mampu mengambarkan kesadaran perencanaan karier'
    ],
    result: [
      'Siswa menunjukkan peningkatan pemahaman tentang pentingnya memiliki kepedulian terhadap karier masa depan mereka setelah mengikuti layanan.',
      'Siswa mampu menjelaskan kembali materi yang berkaitan dengan kepedulian terhadap karier (Concern) dengan cukup baik.',
      'Siswa menunjukkan sikap positif dan antusias dalam mengikuti kegiatan layanan yang berfokus pada perencanaan karier.',
      'Siswa dapat menjawab soal-soal gamifikasi dengan benar sebagai bukti pemahaman terhadap materi yang diberikan.',
      'Layanan gamifikasi ini berkontribusi dalam menumbuhkan kesadaran siswa tentang pentingnya merencanakan karier sejak dini.'
    ]
  },
  control: {
    process: [
      'Saya memahami tujuan kegiatan pada tahap Control (Kendali Diri)',
      'Saya memahami penjelasan materi tentang kendali diri (Control) yang disampaikan selama layanan berlangsung.',
      'Saya merasa kegiatan layanan berlangsung menarik dan membantu saya memahami pentingnya kendali diri dalam menentukan arah karier.',
      'Saya berpartisipasi aktif dalam kegiatan gamifikasi yang diberikan selama layanan.',
      'Saya merasa seluruh proses kegiatan layanan berjalan dengan baik, terarah, dan memudahkan saya dalam memahami materi yang disampaikan.'
    ],
    result: [
      'Siswa menunjukkan pemahaman tentang pentingnya kendali diri dalam mengelola dan mengarahkan jalur kariernya.',
      'Siswa mampu memahami dan menjelaskan kembali materi tentang kendali diri (Control) yang telah diberikan.',
      'Siswa memperlihatkan sikap kemandirian, tanggung jawab, dan disiplin selama serta setelah mengikuti kegiatan layanan.',
      'Siswa mampu menjawab soal-soal gamifikasi dengan baik sebagai bukti pemahaman terhadap materi yang disampaikan.',
      'Siswa menunjukkan perubahan positif dalam mengelola arah kariernya melalui peningkatan kemampuan kendali diri.'
    ]
  },
  curiosity: {
    process: [
      'Saya melaksanakan layanan dengan tujuan menumbuhkan pemahaman siswa tentang rasa ingin tahu siswa dalam eksplorasi karier.',
      'Saya memberikan penjelasan yang membantu siswa memahami pentingnya rasa ingin tahu dalam eksplorasi karier.',
      'Saya memberikan pengarahan yang jelas agar siswa memahami aturan dan tujuan dari gamifikasi yang dilakukan.',
      'Saya mengamati dan memberikan umpan balik kepada siswa selama kegiatan gamifikasi berlangsung.',
      'Saya memastikan bahwa kegiatan gamifikasi mendukung pemahaman siswa terhadap materi keingintahuan (Curiosity).'
    ],
    result: [
      'Siswa menunjukkan rasa ingin tahu yang tinggi terhadap berbagai peluang karier pada saat catatan harian.',
      'Siswa mampu menjelaskan pentingnya sikap rasa ingin tahu dalam proses eksplorasi karier.',
      'Siswa memahami materi keingintahuan (Curiosity) dengan baik setelah mengikuti kegiatan layanan.',
      'Siswa aktif dan bersemangat dalam menjawab serta menyelesaikan soal-soal gamifikasi yang diberikan.',
      'Siswa menunjukkan keberanian dalam mengemukakan ide atau pilihan karier yang diminati melalui aktivitas gamifikasi.'
    ]
  },
  confidence: {
    process: [
      'Saya menyampaikan materi tentang pentingnya sikap percaya diri dalam menghadapi tantangan karier dengan jelas dan mudah dipahami siswa.',
      'Saya membimbing siswa dalam memahami konsep kepercayaan diri (Confidence) melalui kegiatan refleksi diri.',
      'Saya megarahkan siswa agar aktif dan percaya diri dalam berpartisipasi selama kegiatan layanan berlangsung.',
      'Saya mengarahkan siswa untuk menjawab soal-soal gamifikasi yang berkaitan dengan topik kepercayaan diri secara antusias dan mandiri.',
      'Saya memberikan umpan balik dan motivasi yang membangun agar siswa semakin yakin terhadap kemampuan dirinya dalam merencanakan karier.'
    ],
    result: [
      'Siswa menunjukkan pemahaman yang baik tentang pentingnya sikap percaya diri dalam menghadapi tantangan karier.',
      'Siswa dapat menjelaskan kembali isi materi tentang kepercayaan diri (Confidence) dengan cukup jelas.',
      'Siswa memperlihatkan sikap percaya diri selama mengikuti kegiatan layanan berlangsung.',
      'Siswa mampu menyelesaikan soal-soal gamifikasi dengan baik dan menunjukkan pemahaman terhadap isi materi.',
      'Siswa menunjukkan perubahan positif dalam keyakinan terhadap kemampuan diri setelah mengikuti layanan.'
    ]
  }
};

const calculateScore = (answers: number[]): { total: number; interpretation: string; level: string } => {
  const total = answers.reduce((sum, ans) => sum + ans, 0);
  let interpretation = '';
  let level = '';
  
  if (total >= 12 && total <= 15) {
    interpretation = 'Sudah baik dan mandiri';
    level = 'tinggi';
  } else if (total >= 8 && total <= 11) {
    interpretation = 'Perlu penguatan';
    level = 'sedang';
  } else if (total >= 5 && total <= 7) {
    interpretation = 'Perlu intervensi atau pendampingan lebih intens';
    level = 'rendah';
  } else {
    interpretation = 'Skor di luar rentang normal';
    level = 'tidak valid';
  }
  
  return { total, interpretation, level };
};

export default function GuruEvaluationPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const stage = (params?.stage as string) || 'start';
  // Special case for CONTROL: only show result evaluation (process is for students)
  const showProcessEval = stage !== 'control';
  
  // Start with process evaluation if available, otherwise start with result
  const [currentEval, setCurrentEval] = useState<'process' | 'result'>(showProcessEval ? 'process' : 'result');
  const [processAnswers, setProcessAnswers] = useState<number[]>([]);
  const [resultAnswers, setResultAnswers] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isGuru, setIsGuru] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      router.push('/login');
      return;
    }

    const checkRole = async () => {
      try {
        const userRes = await fetch(`/api/users?userId=${encodeURIComponent(user.uid)}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.data?.role === 'guru') {
            setIsGuru(true);
          } else {
            router.push('/journey');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking role:', error);
      } finally {
        setChecking(false);
      }
    };

    checkRole();
  }, [user, router]);

  const questions = EVALUATION_QUESTIONS[stage] || EVALUATION_QUESTIONS.start;

  const handleAnswer = (type: 'process' | 'result', index: number, value: number) => {
    if (type === 'process') {
      const newAnswers = [...processAnswers];
      newAnswers[index] = value;
      setProcessAnswers(newAnswers);
    } else {
      const newAnswers = [...resultAnswers];
      newAnswers[index] = value;
      setResultAnswers(newAnswers);
    }
  };

  const handleSubmit = async (type: 'process' | 'result') => {
    const answers = type === 'process' ? processAnswers : resultAnswers;
    const questionsForType = type === 'process' ? questions.process : questions.result;

    if (answers.length !== questionsForType.length || answers.some(a => !a)) {
      alert('Silakan jawab semua pertanyaan');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.uid,
          type: `guru-${type}`,
          stage: stage,
          answers,
          evaluatorRole: 'guru'
        })
      });

      if (response.ok) {
        alert(`Evaluasi ${type === 'process' ? 'Proses' : 'Hasil'} berhasil disimpan!`);
        if (type === 'process' && showProcessEval) {
          // Move to result evaluation after process is saved
          setCurrentEval('result');
        } else {
          // Both evaluations completed, go back to journey
          router.push('/journey');
        }
      } else {
        alert('Terjadi kesalahan saat menyimpan evaluasi');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

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

  if (!isGuru) {
    return null;
  }

  const stageLabels: Record<string, string> = {
    start: 'START (Pertemuan Pertama)',
    concern: 'CONCERN (Pertemuan Kedua)',
    control: 'CONTROL (Pertemuan Ketiga)',
    curiosity: 'CURIOSITY (Pertemuan Keempat)',
    confidence: 'CONFIDENCE (Pertemuan Kelima)'
  };

  const currentQuestions = currentEval === 'process' ? questions.process : questions.result;
  const currentAnswers = currentEval === 'process' ? processAnswers : resultAnswers;
  const allAnswered = currentAnswers.filter(a => a > 0).length === currentQuestions.length;
  const score = allAnswered ? calculateScore(currentAnswers) : { total: 0, interpretation: '', level: '' };

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
              <h2 className="text-3xl font-extrabold text-white drop-shadow mb-4">
                Evaluasi {currentEval === 'process' ? 'Proses' : 'Hasil'} - {stageLabels[stage] || stage.toUpperCase()}
              </h2>
              <div className="space-y-2 text-white/95 font-semibold mb-4">
                <p>Petunjuk:</p>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>Bacalah secara teliti.</li>
                  <li>Berilah tanda centang (√) pada kolom jawaban yang tersedia.</li>
                  <li>Pilihan jawaban: 1 = Tidak Setuju, 2 = Setuju, 3 = Sangat Setuju</li>
                </ul>
              </div>
              {allAnswered && (
                <div className="bg-white/20 rounded-lg p-4 mt-4">
                  <p className="text-white font-bold">Total Skor: {score.total}</p>
                  <p className="text-white">Interpretasi: {score.interpretation} ({score.level})</p>
                  <div className="text-white text-sm mt-2 space-y-1">
                    <p>Skoring:</p>
                    <p>• Tidak Setuju: 1</p>
                    <p>• Setuju: 2</p>
                    <p>• Sangat Setuju: 3</p>
                    <p className="mt-2 font-bold">Interpretasi:</p>
                    <p>• 5-7: Perlu intervensi atau pendampingan lebih intens (rendah)</p>
                    <p>• 8-11: Perlu penguatan (sedang)</p>
                    <p>• 12-15: Sudah baik dan mandiri (tinggi)</p>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT PANEL */}
            <div className="max-h-[65vh] overflow-auto pr-2">
              <table className="w-full text-white/95">
                <thead>
                  <tr className="bg-white/20">
                    <th className="border-4 border-white/60 p-2 text-left">No</th>
                    <th className="border-4 border-white/60 p-2 text-left">Aspek yang diobservasi</th>
                    <th className="border-4 border-white/60 p-2 text-center">1</th>
                    <th className="border-4 border-white/60 p-2 text-center">2</th>
                    <th className="border-4 border-white/60 p-2 text-center">3</th>
                  </tr>
                </thead>
                <tbody>
                  {currentQuestions.map((question, index) => (
                    <tr key={index} className="bg-white/10">
                      <td className="border-4 border-white/60 p-2 text-center font-extrabold">{index + 1}</td>
                      <td className="border-4 border-white/60 p-2 text-sm">{question}</td>
                      <td className="border-4 border-white/60 p-2 text-center">
                        <input
                          type="radio"
                          name={`${currentEval}-q${index}`}
                          checked={currentAnswers[index] === 1}
                          onChange={() => handleAnswer(currentEval, index, 1)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="border-4 border-white/60 p-2 text-center">
                        <input
                          type="radio"
                          name={`${currentEval}-q${index}`}
                          checked={currentAnswers[index] === 2}
                          onChange={() => handleAnswer(currentEval, index, 2)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="border-4 border-white/60 p-2 text-center">
                        <input
                          type="radio"
                          name={`${currentEval}-q${index}`}
                          checked={currentAnswers[index] === 3}
                          onChange={() => handleAnswer(currentEval, index, 3)}
                          className="cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between mt-6">
                <GameButton 
                  onClick={() => router.push('/journey')} 
                  className="from-gray-400 to-gray-600"
                  disabled={saving}
                >
                  Kembali ke Journey
                </GameButton>
                <GameButton 
                  onClick={() => handleSubmit(currentEval)} 
                  className="from-green-400 to-green-600"
                  disabled={saving}
                >
                  {saving ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
                </GameButton>
              </div>
            </div>
          </div>
        </GameCard>
      </div>
    </div>
  );
}

