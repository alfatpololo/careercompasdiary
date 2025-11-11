'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameModal, GameButton, GameBadge } from '../../../components/GameUI';
import { TextToSpeech } from '../../../components/TextToSpeech';
import {
  weightedAssessment,
  weightedIntroSlides,
  weightedStageOrder,
  type WeightedStageId,
} from '../../../lib/stageContent';

interface QuizData {
  concern: number[];
  control: number[];
  curiosity: number[];
  confidence: number[];
}

const quizStages = ['concern','control','curiosity','confidence'] as const;
type QuizStage = typeof quizStages[number];
function isQuizStage(s: string): s is QuizStage {
  return (quizStages as readonly string[]).includes(s);
}


export function QuizComponent({ initialStage = 'concern', showIntroDefault = false }: { initialStage?: 'concern'|'control'|'curiosity'|'confidence', showIntroDefault?: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const [showIntro, setShowIntro] = useState(showIntroDefault);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentStage, setCurrentStage] = useState<'concern' | 'control' | 'curiosity' | 'confidence' | 'results' | 'congratulations'>(initialStage);
  const [answers, setAnswers] = useState<QuizData>({
    concern: [],
    control: [],
    curiosity: [],
    confidence: []
  });
  const [stageMessage, setStageMessage] = useState<string>('');

  const questions = {
    concern: [
      'Saya memiliki gambaran tujuan karier jangka pendek dan panjang',
      'Saya rutin meninjau rencana masa depan saya',
      'Saya menyadari dampak pilihan hari ini terhadap masa depan',
      'Saya mengetahui jalur pendidikan/keahlian untuk karier impian',
      'Saya memiliki daftar langkah konkret menuju tujuan karier',
      'Saya mengalokasikan waktu khusus untuk merencanakan karier'
    ],
    control: [
      'Saya mengambil keputusan karier secara mandiri dan bertanggung jawab',
      'Saya mengatur waktu dan prioritas untuk mendukung rencana karier',
      'Saya konsisten menjalankan keputusan yang sudah saya buat',
      'Saya tetap pada rencana meskipun ada distraksi dari teman/lingkungan',
      'Saya mengevaluasi keputusan karier saya secara berkala',
      'Saya mampu mengatakan “tidak” pada hal yang tidak sejalan dengan tujuan'
    ],
    curiosity: [
      'Saya mencari informasi profesi melalui membaca/menonton/berdiskusi',
      'Saya mengikuti kegiatan eksplorasi (webinar, kunjungan industri, dsb.)',
      'Saya mencoba berbagai peran/tugas untuk menemukan minat saya',
      'Saya bertanya pada orang berpengalaman tentang dunia kerja',
      'Saya mengeksplorasi beberapa jalur alternatif sebelum memilih',
      'Saya tertarik mempelajari bidang baru yang relevan dengan karier'
    ],
    confidence: [
      'Saya percaya diri menghadapi tugas baru yang menantang',
      'Saya yakin mampu menyelesaikan target yang saya tetapkan',
      'Saya berani presentasi/menunjukkan karya di depan orang lain',
      'Saya tetap tenang dan mencari solusi saat menemui hambatan',
      'Saya yakin bisa mempelajari skill baru yang dibutuhkan',
      'Saya merasa mampu bersaing secara sehat dengan orang lain'
    ]
  };

  const handleIntroNext = () => {
    setShowIntro(false);
    setShowInstructions(true);
  };

  const handleInstructionsNext = () => {
    setShowInstructions(false);
  };

  const handleHome = () => {
    router.push('/journey');
  };

  const handleAnswer = (stage: keyof QuizData, index: number, value: number) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      if (!newAnswers[stage]) newAnswers[stage] = [];
      newAnswers[stage][index] = value;
      return newAnswers;
    });
  };

  const handleStageComplete = async () => {
    if (!isQuizStage(currentStage)) return;
    const stageKey = currentStage as keyof QuizData;
    
    // VALIDASI KETAT: Pastikan semua 6 pertanyaan sudah diisi (index 0-5 semua punya nilai > 0)
    const stageAnswers = answers[stageKey] || [];
    
    // Cek: harus ada 6 jawaban DAN semua index 0-5 punya nilai > 0
    const allQuestionsAnswered = stageAnswers.length === 6 && 
      [0, 1, 2, 3, 4, 5].every(index => {
        const answer = stageAnswers[index];
        return answer !== undefined && answer !== null && answer > 0;
      });
    
    if (!allQuestionsAnswered) {
      setStageMessage('Silakan jawab semua 6 pertanyaan terlebih dahulu!');
      return;
    }

    // Clear any message
    setStageMessage('');

    // Move to next quiz stage without showing results until the end
    const currentStageIndex = weightedStageOrder.indexOf(currentStage as WeightedStageId);

    if (currentStageIndex < weightedStageOrder.length - 1) {
      const nextStage = weightedStageOrder[currentStageIndex + 1] as 'control' | 'curiosity' | 'confidence';
      setCurrentStage(nextStage);
    } else {
      setCurrentStage('results');
    }
  };

  const handleNextAfterResults = async () => {
    if (!user) return;
    
    // VALIDASI: Pastikan semua 4 quiz pembuka sudah diisi (concern, control, curiosity, confidence)
    const allQuizzesCompleted = ['concern', 'control', 'curiosity', 'confidence'].every(stage => {
      const stageAnswers = answers[stage as keyof QuizData] || [];
      return stageAnswers.length === 6 && stageAnswers.every(ans => ans > 0);
    });
    
    if (!allQuizzesCompleted) {
      alert('Silakan selesaikan semua quiz pembuka terlebih dahulu (Concern, Control, Curiosity, Confidence)');
      return;
    }
    
    const { scores, total, percent, category } = calculateResults();
    
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          answers,
          scores,
          total,
          percent,
          category
        }),
      });

      if (response.ok) {
        // CATATAN: JANGAN set START progress di sini!
        // START progress hanya diset setelah SEMUA tahap START selesai:
        // Quiz pembuka → Adaptabilitas Intro → Diary → Evaluation Process → Evaluation Result
        // START progress akan diset di evaluation-result/page.tsx setelah semua tahap selesai
        
        console.log('[Quiz] Quiz pembuka selesai, lanjut ke adaptabilitas-intro');
        
        // After saving quiz results, lanjut ke sesi pengenalan adaptabilitas karir (dengan voice)
        router.push('/adaptabilitas-intro');
      } else {
        alert('Terjadi kesalahan saat menyimpan hasil');
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
      alert('Terjadi kesalahan saat menyimpan hasil');
    }
  };

  const calculateResults = () => {
    // Safe reduce: filter undefined/null dan hanya jumlahkan nilai valid (> 0)
    const safeReduce = (arr: number[]) => {
      return arr.filter((v): v is number => v !== undefined && v !== null && v > 0)
        .reduce((a, b) => a + b, 0);
    };
    
    const scores = {
      concern: safeReduce(answers.concern || []),
      control: safeReduce(answers.control || []),
      curiosity: safeReduce(answers.curiosity || []),
      confidence: safeReduce(answers.confidence || [])
    };

    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    const percent = (total / 120) * 100;

    let category = 'Rendah';
    if (percent >= 70) category = 'Tinggi';
    else if (percent >= 50) category = 'Normal';
    else category = 'Rendah';

    return { scores, total, percent, category };
  };


  if (showIntro) {
    return (
      <GameModal
        open={true}
        onClose={handleHome}
        title={<span>Selamat Datang! 🌟</span>}
        right={
          <div className="flex flex-col gap-3">
            <GameButton onClick={handleHome}>Home</GameButton>
            <GameButton onClick={handleIntroNext} className="from-green-400 to-green-600">Next</GameButton>
          </div>
        }
      >
        <div className="space-y-3 text-emerald-900 font-semibold">
          <p>Halo, teman-teman! 👋😊 Kuesioner ini membantu kamu memahami arah masa depan dan potensi diri.</p>
          <p>Jawablah dengan jujur; tidak ada jawaban benar/salah. Jadi diri sendiri! ✅</p>
          <p>Kami menghargai kejujuranmu. Hasil digunakan untuk pengembangan belajar. 🚀</p>
        </div>
      </GameModal>
    );
  }

  if (showInstructions) {
    return (
      <GameModal
        open={true}
        onClose={handleHome}
        title={<span>Petunjuk Pengisian 📋</span>}
        right={
          <div className="flex flex-col gap-3">
            <GameButton onClick={handleHome}>Home</GameButton>
            <GameButton onClick={handleInstructionsNext} className="from-green-400 to-green-600">Mulai</GameButton>
          </div>
        }
      >
        <div className="space-y-3 text-emerald-900 font-semibold">
          <p>Gunakan skala PK/SK/K/CK/TK untuk alur Pengenalan. Di tahap Assessment (Journey), kamu akan menjawab pilihan ganda benar/salah.</p>
          <ul className="list-disc ml-5">
            <li>Isi sesuai kondisimu.</li>
            <li>Di akhir Confidence tampil hasil total.</li>
          </ul>
        </div>
      </GameModal>
    );
  }

  if (currentStage === 'results') {
    const { scores, total, percent, category } = calculateResults();
    
    // VALIDASI: Pastikan semua 4 quiz pembuka sudah diisi sebelum bisa next
    const allQuizzesCompleted = ['concern', 'control', 'curiosity', 'confidence'].every(stage => {
      const stageAnswers = answers[stage as keyof QuizData] || [];
      return stageAnswers.length === 6 && stageAnswers.every(ans => ans > 0);
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="bg-white bg-opacity-95 rounded-lg shadow-2xl p-8 max-w-3xl w-full">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Hasil Kuesioner 📊</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-3">Skor Anda:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Career Concern:</p>
                  <p className="text-2xl font-bold text-blue-600">{scores.concern}</p>
                </div>
                <div>
                  <p className="font-semibold">Career Control:</p>
                  <p className="text-2xl font-bold text-green-600">{scores.control}</p>
                </div>
                <div>
                  <p className="font-semibold">Career Curiosity:</p>
                  <p className="text-2xl font-bold text-yellow-600">{scores.curiosity}</p>
                </div>
                <div>
                  <p className="font-semibold">Career Confidence:</p>
                  <p className="text-2xl font-bold text-purple-600">{scores.confidence}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="font-semibold text-lg">Total Skor:</p>
                <p className="text-3xl font-bold text-gray-800">{total} / 120</p>
              </div>
              <div className="mt-2">
                <p className="font-semibold">Persentase:</p>
                <p className="text-2xl font-bold text-indigo-600">{percent.toFixed(1)}%</p>
              </div>
              <div className="mt-2">
                <p className="font-semibold">Kategori:</p>
                <p className={`text-2xl font-bold ${
                  category === 'Tinggi' ? 'text-green-600' : 
                  category === 'Normal' ? 'text-yellow-600' : 'text-red-600'
                }`}>{category}</p>
              </div>
            </div>
          </div>

          {/* Validasi warning jika belum semua quiz selesai */}
          {!allQuizzesCompleted && (
            <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
              <p className="text-yellow-800 font-semibold">
                ⚠️ Silakan selesaikan semua quiz pembuka terlebih dahulu (Concern, Control, Curiosity, Confidence)
              </p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button
              onClick={handleHome}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Home
            </button>
            <button
              onClick={handleNextAfterResults}
              disabled={!allQuizzesCompleted}
              className={`px-6 py-2 rounded-lg transition-colors ${
                allQuizzesCompleted
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStage === 'congratulations') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="bg-white bg-opacity-95 rounded-lg shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Selamat! 🎊</h2>
          <p className="text-xl text-gray-600 mb-6">
            Anda telah menyelesaikan kuesioner Career Compass DIARY dengan baik!
          </p>
          <p className="text-lg text-gray-700 mb-8">
            Semoga hasil ini membantu Anda memahami lebih dalam tentang karir dan masa depan Anda. 🌟
          </p>
          
          <button
            onClick={handleHome}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors text-lg font-bold"
          >
            Kembali ke Journey
          </button>
        </div>
      </div>
    );
  }

  const currentQuestions = isQuizStage(currentStage)
    ? questions[currentStage]
    : [];
  const stageAnswers = isQuizStage(currentStage)
    ? answers[currentStage as keyof QuizData] || []
    : [];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      backgroundImage: 'url(/Background_Mulai.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Title Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-yellow-400 px-6 py-3 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 capitalize">
            Career {currentStage}
          </h2>
        </div>
      </div>

      <div className="max-w-5xl w-full mx-auto pt-24">
        <div className="grid grid-cols-3 gap-3">
          {currentQuestions.map((question, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg p-4 text-white">
              {/* Question Number and Text */}
              <div className="mb-3">
                <p className="font-medium text-white text-xs leading-relaxed">
                  {index + 1}. {question}
                </p>
              </div>

              {/* Response Options */}
              <div className="space-y-1.5 mb-3">
                {[
                  { value: 1, label: 'Tidak Kuat', short: 'TK' },
                  { value: 2, label: 'Cukup kuat', short: 'CK' },
                  { value: 3, label: 'Kuat', short: 'K' },
                  { value: 4, label: 'Sangat kuat', short: 'SK' },
                  { value: 5, label: 'Paling Kuat', short: 'PK' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer rounded p-1.5 transition-all hover:bg-blue-600">
                    <input
                      type="radio"
                      name={`${currentStage}-${index}`}
                      value={option.value}
                      checked={stageAnswers[index] === option.value}
                      onChange={() => handleAnswer(currentStage as keyof QuizData, index, option.value)}
                      className="mr-2 w-3 h-3"
                    />
                    <span className="text-xs text-white">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handleHome}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Home
          </button>
          <button
            onClick={handleStageComplete}
            disabled={(() => {
              // VALIDASI KETAT: Pastikan semua 6 pertanyaan sudah diisi
              const allAnswered = stageAnswers.length === 6 && 
                [0, 1, 2, 3, 4, 5].every(index => {
                  const answer = stageAnswers[index];
                  return answer !== undefined && answer !== null && answer > 0;
                });
              return !allAnswered;
            })()}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        {stageMessage && (
          <div className="mt-4 text-center text-sm font-semibold text-yellow-200">
            {stageMessage}
          </div>
        )}
      </div>
    </div>
  );
}

// =========================
// Assessment (Multiple-Choice, Correct/Incorrect)
// =========================
type MCQ = { q: string; options: string[]; correct: number };

const assessmentBank: Record<'concern'|'control'|'curiosity'|'confidence', MCQ[]> = {
  concern: [],
  control: [],
  curiosity: [],
  confidence: [],
};

export function AssessmentComponent({ stage }: { stage: 'concern'|'control'|'curiosity'|'confidence' }) {
  const router = useRouter();
  const { user } = useAuth();
  const isWeightedStage = stage === 'concern' || stage === 'control' || stage === 'curiosity' || stage === 'confidence';
  const weightedStage = isWeightedStage ? stage as 'concern'|'control'|'curiosity'|'confidence' : null;
  const mcqQuestions = assessmentBank[stage];
  const weightedQuestions = weightedStage ? weightedAssessment[weightedStage] : [];
  const questions = isWeightedStage ? weightedQuestions : mcqQuestions;
  const introSlides = weightedStage ? weightedIntroSlides[weightedStage] : [];
  const [introStep, setIntroStep] = useState(weightedStage ? 0 : 0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [modal, setModal] = useState<null | { type: 'success' | 'fail'; correct: number; detail?: { totalScore: number; maxScore: number; percent: number } }>(null);
  const passThreshold = 4; // minimal benar 4/6 untuk stage lain
  const weightedMaxScore = weightedStage ? weightedQuestions.length * 40 : 0;
  const weightedPassThreshold = weightedStage ? Math.round(weightedMaxScore * 0.7) : 0; // minimal 70% dari total

  const answeredAll = answers.every(a => a >= 0);
  const totalQuestions = questions.length;
  const currentAnswer = answers[currentQuestion] ?? -1;
  const canProceed = !isWeightedStage || currentAnswer >= 0;
  const weightedItems = isWeightedStage ? weightedQuestions : [];
  const weightedTitleMap: Record<'concern'|'control'|'curiosity'|'confidence', string> = {
    concern: 'Concern Assessment',
    control: 'Control Assessment',
    curiosity: 'Curiosity Assessment',
    confidence: 'Confidence Assessment',
  };
  const weightedPromptMap: Record<'concern'|'control'|'curiosity'|'confidence', string> = {
    concern: 'kepedulianmu terhadap karier',
    control: 'kendali dirimu dalam mengambil keputusan karier',
    curiosity: 'rasa ingin tahumu dalam eksplorasi karier',
    confidence: 'kepercayaan dirimu dalam menghadapi tantangan karier',
  };
  const weightedSuccessActions: Record<'concern'|'control'|'curiosity'|'confidence', Array<{ href: string; label: string; className: string }>> = {
    concern: [
      { href: '/concern/diary', label: 'Catatan Harian Concern', className: 'from-yellow-300 to-orange-400' },
      { href: '/concern/evaluation-process-student', label: 'Evaluasi Siswa Concern', className: 'from-emerald-400 to-teal-500' },
      { href: '/concern', label: 'Menu Concern', className: 'from-indigo-400 to-purple-500' },
    ],
    control: [
      { href: '/control/diary', label: 'Catatan Harian Control', className: 'from-yellow-300 to-orange-400' },
      { href: '/control/evaluation-process-student', label: 'Evaluasi Siswa Control', className: 'from-emerald-400 to-teal-500' },
      { href: '/control', label: 'Menu Control', className: 'from-indigo-400 to-purple-500' },
    ],
    curiosity: [
      { href: '/curiosity/diary', label: 'Catatan Harian Curiosity', className: 'from-yellow-300 to-orange-400' },
      { href: '/curiosity/evaluation-process-student', label: 'Evaluasi Siswa Curiosity', className: 'from-emerald-400 to-teal-500' },
      { href: '/curiosity', label: 'Menu Curiosity', className: 'from-indigo-400 to-purple-500' },
    ],
    confidence: [
      { href: '/confidence/diary', label: 'Catatan Harian Confidence', className: 'from-yellow-300 to-orange-400' },
      { href: '/confidence/evaluation-process-student', label: 'Evaluasi Siswa Confidence', className: 'from-emerald-400 to-teal-500' },
      { href: '/confidence', label: 'Menu Confidence', className: 'from-indigo-400 to-purple-500' },
    ],
  };

  const handlePrevQuestion = () => {
    if (!isWeightedStage) return;
    setCurrentQuestion((prev) => Math.max(prev - 1, 0));
  };

  const handleNextQuestion = () => {
    if (!isWeightedStage) return;
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => Math.min(prev + 1, totalQuestions - 1));
    }
  };

  if (isWeightedStage && introStep < introSlides.length) {
    const slide = introSlides[introStep];
    const voiceText = slide.paragraphs.join(' ');
    const isLastSlide = introStep === introSlides.length - 1;

    return (
      <GameModal
        open={true}
        onClose={() => router.push('/journey')}
        title={<span>{slide.title}</span>}
        right={
          <div className="flex flex-col gap-3">
            <TextToSpeech text={voiceText} className="bg-white/80 rounded-full p-3 shadow-lg hover:scale-105 transition-transform" />
            <GameButton onClick={() => router.push('/journey')}>Home</GameButton>
            <GameButton onClick={() => setIntroStep((prev) => prev + 1)} className="from-green-400 to-green-600">
              {isLastSlide ? 'Mulai Soal' : 'Next'}
            </GameButton>
          </div>
        }
      >
        <div className="space-y-4 text-emerald-900 font-semibold whitespace-pre-line">
          {slide.paragraphs.map((paragraph, idx) => (
            <p key={`${slide.key}-${idx}`}>{paragraph}</p>
          ))}
        </div>
      </GameModal>
    );
  }

  const handleChoose = (qIdx: number, optIdx: number) => {
    const copy = [...answers];
    copy[qIdx] = optIdx;
    setAnswers(copy);
  };

  const submit = async () => {
    if (!answeredAll || !user) return;
    const weightedScore = isWeightedStage
      ? answers.reduce((sum, a, idx) => {
          if (a < 0) return sum;
          const selected = weightedQuestions[idx]?.options[a];
          return sum + (selected?.score || 0);
        }, 0)
      : 0;
    const correctCount = isWeightedStage
      ? weightedScore
      : answers.reduce((sum, a, idx) => sum + (a === mcqQuestions[idx].correct ? 1 : 0), 0);

    const passed = isWeightedStage ? weightedScore >= weightedPassThreshold : correctCount >= passThreshold;
    const percentScore = isWeightedStage
      ? (weightedMaxScore > 0 ? Math.round((weightedScore / weightedMaxScore) * 100) : 0)
      : Math.round((correctCount / mcqQuestions.length) * 100);

    // Save attempt and progress
    try {
      await fetch('/api/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          stage,
          answers,
          score: percentScore,
          passed,
        }),
      });
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          levelId: stage,
          score: percentScore,
          completed: passed
        })
      });
    } catch (e) {
      console.error(e);
    }

    const modalPayload: {
      type: 'success' | 'fail';
      correct: number;
      detail?: { totalScore: number; maxScore: number; percent: number };
    } = isWeightedStage
      ? {
          type: passed ? 'success' : 'fail',
          correct: weightedScore,
          detail: {
            totalScore: weightedScore,
            maxScore: weightedMaxScore,
            percent: percentScore,
          },
        }
      : {
          type: passed ? 'success' : 'fail',
          correct: correctCount,
        };

    setModal(modalPayload);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      backgroundImage: 'url(/Background_Mulai.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="max-w-5xl w-full mx-auto">
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-yellow-400 px-6 py-3 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 capitalize">Assessment {stage}</h2>
          </div>
        </div>

        {isWeightedStage ? (
          <div className="pt-24 space-y-6">
            <div className="flex items-start justify-between text-white">
              <div>
                <GameBadge className="bg-white/25 text-emerald-900 border-white">
                  {weightedStage ? weightedTitleMap[weightedStage] : 'Weighted Assessment'}
                </GameBadge>
                <h2 className="text-3xl font-extrabold drop-shadow mt-2">
                  Pertanyaan {currentQuestion + 1} dari {totalQuestions}
                </h2>
                <p className="text-white/85 font-semibold">
                  Pilih jawaban yang paling menggambarkan {weightedStage ? weightedPromptMap[weightedStage] : 'persepsimu'}.
                </p>
              </div>
              <div className="text-right text-white/80 text-sm font-semibold">
                <p>Bobot jawaban: 10% – 40%</p>
                <p>Minimal kelulusan: 70%</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg p-6 text-white">
              <p className="text-base font-bold mb-4">
                {currentQuestion + 1}. {weightedItems[currentQuestion]?.q}
              </p>
              <div className="space-y-3">
                {weightedItems[currentQuestion]?.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleChoose(currentQuestion, optIdx)}
                    className={`w-full text-left px-3 py-2 rounded bg-white/15 hover:bg-white/25 transition-colors text-sm ${
                      answers[currentQuestion] === optIdx ? 'ring-2 ring-white' : ''
                    }`}
                  >
                    <span className="block font-semibold">
                      {String.fromCharCode(65 + optIdx)}. {opt.text}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-yellow-200 font-bold">
                      Bobot: {opt.score}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <GameButton onClick={() => router.push('/journey')} className="from-gray-400 to-gray-600">
                Home
              </GameButton>
              <div className="flex gap-3">
                {currentQuestion > 0 && (
                  <GameButton
                    type="button"
                    onClick={handlePrevQuestion}
                    className="from-blue-400 to-blue-600"
                  >
                    Sebelumnya
                  </GameButton>
                )}
                <GameButton
                  type="button"
                  onClick={currentQuestion === totalQuestions - 1 ? submit : handleNextQuestion}
                  disabled={!canProceed}
                  className="from-yellow-300 to-orange-400 disabled:opacity-60 disabled:pointer-events-none"
                >
                  {currentQuestion === totalQuestions - 1 ? 'Submit' : 'Selanjutnya'}
                </GameButton>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 pt-24">
              {questions.map((item, qIdx) => (
                <div key={qIdx} className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg p-4 text-white">
                  <p className="text-xs font-semibold mb-3">{qIdx + 1}. {item.q}</p>
                  <div className="space-y-2">
                    {(item as MCQ).options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleChoose(qIdx, optIdx)}
                        className={`w-full text-left px-3 py-2 rounded bg-white/15 hover:bg-white/25 transition-colors text-xs ${
                          answers[qIdx] === optIdx ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}. {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={() => router.push('/journey')} className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600">Home</button>
              <button disabled={!answeredAll} onClick={submit} className="bg-green-500 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg hover:bg-green-600">Submit</button>
            </div>
          </>
        )}

        {modal && (
          <GameModal
            open={true}
            onClose={() => setModal(null)}
            title={modal.type === 'success' ? 'Congrats! 🎉' : 'Belum Lulus ⚠️'}
            right={
              modal.type === 'success' ? (
                <div className="flex flex-col gap-3">
                  {weightedStage &&
                    weightedSuccessActions[weightedStage].map((item) => (
                      <GameButton key={item.href} onClick={() => router.push(item.href)} className={item.className}>
                        {item.label}
                      </GameButton>
                    ))}
                  <GameButton onClick={() => router.push('/journey?refresh=true')} className="from-gray-400 to-gray-600">
                    Kembali ke Journey
                  </GameButton>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <GameButton
                    onClick={() => {
                      setModal(null);
                      setAnswers(Array(questions.length).fill(-1));
                      if (isWeightedStage) {
                        setCurrentQuestion(0);
                      }
                    }}
                    className="from-blue-400 to-blue-600"
                  >
                    Ulang Stage
                  </GameButton>
                  <GameButton onClick={() => router.push('/journey?refresh=true')} className="from-gray-400 to-gray-600">Kembali ke Journey</GameButton>
                </div>
              )
            }
          >
            {isWeightedStage ? (
              <div className="space-y-2 text-emerald-900 font-bold">
                <p>Skor total: {modal.detail?.totalScore} / {modal.detail?.maxScore}</p>
                <p>Persentase: {modal.detail?.percent}%</p>
                <p>Target kelulusan: 70%</p>
                {modal.type === 'fail' && (
                  <p className="font-semibold">
                    Pilih jawaban yang paling menggambarkan {weightedStage ? weightedPromptMap[weightedStage] : 'dirimu'} untuk mencapai target nilai.
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className="text-emerald-900 font-bold">Jawaban benar: {modal.correct} / {questions.length}</p>
                {modal.type === 'fail' && <p className="text-emerald-900 mt-2 font-semibold">Coba ulang atau kembali ke Start untuk belajar lagi.</p>}
              </>
            )}
          </GameModal>
        )}
      </div>
    </div>
  );
}
