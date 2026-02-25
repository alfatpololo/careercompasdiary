'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameModal, GameButton, GameBadge, LoadingOverlay } from '../../../components/GameUI';
import { TextToSpeech } from '../../../components/TextToSpeech';
import {
  weightedAssessment,
  weightedIntroSlides,
  weightedStageOrder,
  type WeightedStageId,
  scoreToCategory,
  getCategoryInfo,
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


type CaasQuestions = { concern: string[]; control: string[]; curiosity: string[]; confidence: string[] };
type CaasCmsData = {
  introTitle: string;
  introContent: string;
  instructionTitle: string;
  instructionContent: string;
  questions?: CaasQuestions;
} | null;

const DEFAULT_QUESTIONS_CAAS: CaasQuestions = {
  concern: [
    'Membayangkan seperti apa karier saya di masa depan',
    'Menyadari bahwa pilihan hari ini menentukan masa depan saya',
    'Saya mempersiapkan masa depan',
    'Saya menyadari akan pilihan-pilihan pendidikan dan pilihan karir yang harus saya buat',
    'Merencanakan bagaimana cara mencapai tujuan saya',
    'Saya memikirkan mengenai karir saya',
  ],
  control: [
    'Menjaga diri agar tetap optimis',
    'Saya membuat keputusan sendiri',
    'Bertanggung jawab atas tindakan saya',
    'Tetap teguh dengan keyakinan saya',
    'Mengandalkan kemampuan diri sendiri',
    'Saya melakukan apa yang benar menurut saya',
  ],
  curiosity: [
    'Mengeksplorasi lingkungan sekitar',
    'Mencari peluang-peluang untuk berkembang',
    'Mencari tahu Jalan lain sebelum menentukan pilihan',
    'Mengamati cara-cara yang berbeda dalam melakukan sesuatu',
    'Menyelidiki secara lebih dalam pertanyaan-pertanyaan yang saya miliki',
    'Menjadi ingin tahu tentang peluang-peluang baru',
  ],
  confidence: [
    'Mengerjakan tugas secara efisien',
    'Menjaga dalam melakukan sesuatu dengan baik',
    'Mempelajari keterampilan-ketrampilan baru',
    'Bekerja dengan kemampuan saya',
    'Saya berusaha mengatasi hambatan-hambatan',
    'Menyelesaikan masalah-masalah yang saya hadapi',
  ],
};

const DEFAULT_INTRO_TITLE = 'Selamat Datang! 🌟';
const DEFAULT_INTRO_CONTENT = `Halo, teman-teman! 👋😊
Kami ingin mengajak kalian untuk berpartisipasi dalam pengisian kuesioner ini. Kuesioner ini dirancang khusus untuk memahami bagaimana kalian merencanakan masa depan dan mengembangkan potensi diri. ✨
Jawablah setiap pertanyaan dengan jujur sesuai dengan apa yang kalian rasakan dan pikirkan. Tidak ada jawaban benar atau salah yang terpenting adalah menjadi diri sendiri! ✅
Kami sangat menghargai waktu dan kejujuran kalian. Hasil dari kuesioner ini akan digunakan untuk tujuan penelitian dan pengembangan, tanpa ada kepentingan lain. Jadi, yuk, bantu kami dengan mengisi kuesioner ini secara santai dan sesuai dengan jati diri kalian! 🚀💡
Terima kasih banyak atas partisipasinya! Semoga langkah kecil ini bisa membantu kalian memahami dan merancang masa depan yang lebih cerah. 🌟💪
Silakan isi setiap pertanyaan dengan jujur dan sepenuh hati. Tulis jawaban yang benar-benar mencerminkan dirimu sendiri, sesuai dengan pengalaman, pemikiran, dan perasaanmu selama ini. Tidak ada jawaban yang salah atau benar yang paling penting adalah jawaban itu datang dari dirimu sendiri, bukan karena ingin terlihat baik atau meniru orang lain.`;
const DEFAULT_INSTRUCTION_TITLE = 'Petunjuk Pengisian 📋';
const DEFAULT_INSTRUCTION_CONTENT = `Setiap orang menggunakan kekuatan yang berbeda-beda dalam membangun karirnya. Tidak ada orang yang hebat dalam segala hal, setiap orang lebih kuat dalam beberapa hal dibanding dalam hal-hal lainnya. Silahkan anda tetapkan seberapa kuat anda mengembangkan kemampuan-kemampuan di bawah ini menggunakan skala berikut dengan memberikan tanda lingkaran pada nomor yang sesuai.
Berikut adalah keterangan jawaban:
• 5 = Paling kuat (PK)
• 4 = Sangat kuat (SK)
• 3 = Kuat (K)
• 2 = Cukup kuat (CK)
• 1 = Tidak kuat (TK)
Selanjutnya, TERDAPAT 4 KOLOM yang akan anda isi dengan jawaban yang benar‑benar mencerminkan pengalaman dan kondisi nyata Anda.
1. Career concern
2. Career control
3. Career curiosity
4. Career confidence.`;

export function QuizComponent({ initialStage = 'concern', showIntroDefault = false, isPosttest = false }: { initialStage?: 'concern'|'control'|'curiosity'|'confidence', showIntroDefault?: boolean, isPosttest?: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const [showIntro, setShowIntro] = useState(showIntroDefault);
  const [showInstructions, setShowInstructions] = useState(false);
  const [caasData, setCaasData] = useState<CaasCmsData>(null);
  const [currentStage, setCurrentStage] = useState<'concern' | 'control' | 'curiosity' | 'confidence' | 'results' | 'congratulations'>(initialStage);
  const [answers, setAnswers] = useState<QuizData>({
    concern: [],
    control: [],
    curiosity: [],
    confidence: []
  });
  const [stageMessage, setStageMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const stage = isPosttest ? 'caas2' : 'caas1';
    fetch(`/api/cms/caas?stage=${stage}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const q = json.data.questions;
          const validQuestions: CaasQuestions | undefined =
            q && [q.concern, q.control, q.curiosity, q.confidence].every(
              (arr) => Array.isArray(arr) && arr.length === 6
            )
              ? {
                  concern: (q.concern as string[]).slice(0, 6).map((s, i) => (typeof s === 'string' && s.trim()) ? s : DEFAULT_QUESTIONS_CAAS.concern[i]),
                  control: (q.control as string[]).slice(0, 6).map((s, i) => (typeof s === 'string' && s.trim()) ? s : DEFAULT_QUESTIONS_CAAS.control[i]),
                  curiosity: (q.curiosity as string[]).slice(0, 6).map((s, i) => (typeof s === 'string' && s.trim()) ? s : DEFAULT_QUESTIONS_CAAS.curiosity[i]),
                  confidence: (q.confidence as string[]).slice(0, 6).map((s, i) => (typeof s === 'string' && s.trim()) ? s : DEFAULT_QUESTIONS_CAAS.confidence[i]),
                }
              : undefined;
          setCaasData({
            introTitle: json.data.introTitle ?? (isPosttest ? 'Posttest Adaptabilitas Karier 📊' : DEFAULT_INTRO_TITLE),
            introContent: json.data.introContent ?? DEFAULT_INTRO_CONTENT,
            instructionTitle: json.data.instructionTitle ?? DEFAULT_INSTRUCTION_TITLE,
            instructionContent: json.data.instructionContent ?? DEFAULT_INSTRUCTION_CONTENT,
            questions: validQuestions,
          });
        }
      })
      .catch(() => {});
  }, [isPosttest]);

  const questions: Record<'concern'|'control'|'curiosity'|'confidence', string[]> =
    caasData?.questions &&
    [caasData.questions.concern, caasData.questions.control, caasData.questions.curiosity, caasData.questions.confidence].every(
      (arr) => Array.isArray(arr) && arr.length === 6
    )
      ? caasData.questions
      : DEFAULT_QUESTIONS_CAAS;

  const handleIntroNext = () => {
    setShowIntro(false);
    setShowInstructions(true);
  };

  const handleInstructionsNext = () => {
    setShowInstructions(false);
  };

  const allQuizStagesComplete = ['concern', 'control', 'curiosity', 'confidence'].every(stage => {
    const stageAnswers = answers[stage as keyof QuizData] || [];
    return stageAnswers.length === 6 && stageAnswers.every(ans => ans > 0);
  });
  const hasStartedAnyQuiz = ['concern', 'control', 'curiosity', 'confidence'].some(stage => {
    const stageAnswers = answers[stage as keyof QuizData] || [];
    return stageAnswers.length > 0;
  });

  const handleHome = () => {
    if (hasStartedAnyQuiz && !allQuizStagesComplete) {
      alert('Selesaikan semua quiz terlebih dahulu (6 pertanyaan pada setiap tahap: Concern, Control, Curiosity, Confidence) sebelum kembali.');
      return;
    }
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
    
    setSubmitting(true);
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
          category,
          isPosttest: isPosttest || false
        }),
      });

      if (response.ok) {
        // Flow berbeda untuk pretest dan posttest
        // Pretest: Quiz → Adaptabilitas Intro → Diary → Evaluation Process → Evaluation Result
        // Posttest: Quiz → Diary → Evaluation Process → Evaluation Result (skip intro)
        console.log('[Quiz] Quiz selesai');
        
        if (isPosttest) {
          // Posttest: langsung ke diary, skip intro
          console.log('[Quiz] Posttest - langsung ke diary');
          router.push('/adaptabilitas/diary?posttest=true');
        } else {
          // Pretest: lanjut ke adaptabilitas intro
          console.log('[Quiz] Pretest - lanjut ke adaptabilitas-intro');
          router.push('/adaptabilitas-intro');
        }
      } else {
        alert('Terjadi kesalahan saat menyimpan hasil');
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
      alert('Terjadi kesalahan saat menyimpan hasil');
    } finally {
      setSubmitting(false);
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

    let category: 'Sangat Rendah' | 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi' = 'Rendah';
    if (percent >= 90) category = 'Sangat Tinggi';
    else if (percent >= 70) category = 'Tinggi';
    else if (percent >= 50) category = 'Sedang';
    else if (percent >= 30) category = 'Rendah';
    else category = 'Sangat Rendah';

    return { scores, total, percent, category };
  };


  if (showIntro) {
    const introTitle = caasData?.introTitle ?? (isPosttest ? 'Posttest Adaptabilitas Karier 📊' : DEFAULT_INTRO_TITLE);
    const introContent = caasData?.introContent ?? DEFAULT_INTRO_CONTENT;
    const introParagraphs = introContent.trim().split(/\n\n+/).filter(Boolean);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70" onClick={handleHome} />
        <div className="relative w-full max-w-4xl">
          <div className="bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-400 rounded-[28px] overflow-hidden border-4 border-white/70 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-700 drop-shadow">
                {introTitle}
              </h3>
              <button
                onClick={handleHome}
                className="text-emerald-700 hover:text-emerald-900 transition-colors p-1 rounded-full hover:bg-white/20"
                aria-label="Tutup"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scroll">
              <div className="space-y-3 text-emerald-900 whitespace-pre-line">
                {introParagraphs.length > 0 ? introParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                )) : <p>{introContent}</p>}
              </div>
              
              <div className="flex justify-between gap-3 pt-4 border-t-2 border-emerald-200">
                <GameButton onClick={handleHome}>Home</GameButton>
                <GameButton onClick={handleIntroNext} className="from-green-400 to-green-600">Next</GameButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showInstructions) {
    const instructionTitle = caasData?.instructionTitle ?? DEFAULT_INSTRUCTION_TITLE;
    const instructionContent = caasData?.instructionContent ?? DEFAULT_INSTRUCTION_CONTENT;
    const instructionParagraphs = instructionContent.trim().split(/\n\n+/).filter(Boolean);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70" onClick={handleHome} />
        <div className="relative w-full max-w-4xl">
          <div className="bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-400 rounded-[28px] overflow-hidden border-4 border-white/70 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-700 drop-shadow">{instructionTitle}</h3>
              <button
                onClick={handleHome}
                className="text-emerald-700 hover:text-emerald-900 transition-colors p-1 rounded-full hover:bg-white/20"
                aria-label="Tutup"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scroll">
              <div className="space-y-3 text-emerald-900 whitespace-pre-line">
                {instructionParagraphs.length > 0 ? instructionParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                )) : <p>{instructionContent}</p>}
              </div>
              
              <div className="flex justify-between gap-3 pt-4 border-t-2 border-emerald-200">
                <GameButton onClick={handleHome}>Home</GameButton>
                <GameButton onClick={handleInstructionsNext} className="from-green-400 to-green-600">Mulai</GameButton>
              </div>
            </div>
          </div>
        </div>
      </div>
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
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Skor Anda:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-gray-700">Career Concern:</p>
                  <p className="text-2xl font-bold text-blue-600">{scores.concern}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Career Control:</p>
                  <p className="text-2xl font-bold text-green-600">{scores.control}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Career Curiosity:</p>
                  <p className="text-2xl font-bold text-yellow-600">{scores.curiosity}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Career Confidence:</p>
                  <p className="text-2xl font-bold text-purple-600">{scores.confidence}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="font-semibold text-lg text-gray-800">Total Skor:</p>
                <p className="text-3xl font-bold text-gray-900">{total} / 120</p>
              </div>
              <div className="mt-2">
                <p className="font-semibold text-gray-800">Persentase:</p>
                <p className="text-2xl font-bold text-indigo-700">{percent.toFixed(1)}%</p>
              </div>
              <div className="mt-2">
                <p className="font-semibold text-gray-800">Kategori:</p>
                <p className={`text-2xl font-bold ${
                  category === 'Sangat Tinggi' ? 'text-green-700' :
                  category === 'Tinggi' ? 'text-blue-700' :
                  category === 'Sedang' ? 'text-amber-700' :
                  category === 'Rendah' ? 'text-yellow-700' : 'text-red-700'
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">Selamat! 🎊</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6">
            Anda telah menyelesaikan kuesioner Career Compass DIARY dengan baik!
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-700 mb-8">
            Semoga hasil ini membantu Anda memahami lebih dalam tentang karir dan masa depan Anda. 🌟
          </p>
          
          <button
            onClick={handleHome}
            className="bg-blue-500 text-white px-4 py-2 sm:px-8 sm:py-3 rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base md:text-lg font-bold"
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
    <>
      <LoadingOverlay isLoading={submitting} text="Menyimpan hasil kuesioner..." />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
    </>
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
  
  // Load questions from CMS, fallback to default
  const [cmsQuestions, setCmsQuestions] = useState<Array<{ q: string; options: Array<{ text: string; score: number }> }> | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  
  useEffect(() => {
    if (!weightedStage) {
      setLoadingQuestions(false);
      return;
    }
    
    const loadCMSQuestions = async () => {
      try {
        const res = await fetch(`/api/cms/quiz?stage=${weightedStage}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            setCmsQuestions(data.data);
          } else {
            // Fallback to default
            setCmsQuestions(weightedAssessment[weightedStage]);
          }
        } else {
          // Fallback to default
          setCmsQuestions(weightedAssessment[weightedStage]);
        }
      } catch (error) {
        console.error('Error loading CMS questions:', error);
        // Fallback to default
        setCmsQuestions(weightedAssessment[weightedStage]);
      } finally {
        setLoadingQuestions(false);
      }
    };
    
    loadCMSQuestions();
  }, [weightedStage]);
  
  const weightedQuestions = weightedStage 
    ? (cmsQuestions || weightedAssessment[weightedStage])
    : [];
  const questions = isWeightedStage ? weightedQuestions : mcqQuestions;
  const introSlides = weightedStage ? weightedIntroSlides[weightedStage] : [];
  const [introStep, setIntroStep] = useState(weightedStage ? 0 : 0);
  const [answers, setAnswers] = useState<number[]>([]);
  
  // Update answers array when questions change
  useEffect(() => {
    if (questions.length > 0) {
      setAnswers(Array(questions.length).fill(-1));
    }
  }, [questions.length]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [modal, setModal] = useState<null | { type: 'success' | 'fail'; correct: number; detail?: { totalScore: number; maxScore: number; percent: number; category?: import('../../../lib/stageContent').ScoreCategory } }>(null);
  const [submitting, setSubmitting] = useState(false);
  const passThreshold = 4; // minimal benar 4/6 untuk stage lain
  const weightedMaxScore = weightedStage ? weightedQuestions.length * 40 : 0; // 6 soal * 40 = 240
  const weightedPassThreshold = 180; // minimal 180 (75%) untuk lulus

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
      { href: '/concern/evaluation-result-student', label: 'Evaluasi Hasil Concern', className: 'from-emerald-400 to-teal-500' },
      { href: '/concern', label: 'Menu Concern', className: 'from-indigo-400 to-purple-500' },
    ],
    control: [
      { href: '/control/diary', label: 'Catatan Harian Control', className: 'from-yellow-300 to-orange-400' },
      { href: '/control/evaluation-result-student', label: 'Evaluasi Hasil Control', className: 'from-emerald-400 to-teal-500' },
      { href: '/control', label: 'Menu Control', className: 'from-indigo-400 to-purple-500' },
    ],
    curiosity: [
      { href: '/curiosity/diary', label: 'Catatan Harian Curiosity', className: 'from-yellow-300 to-orange-400' },
      { href: '/curiosity/evaluation-result-student', label: 'Evaluasi Hasil Curiosity', className: 'from-emerald-400 to-teal-500' },
      { href: '/curiosity', label: 'Menu Curiosity', className: 'from-indigo-400 to-purple-500' },
    ],
    confidence: [
      { href: '/confidence/diary', label: 'Catatan Harian Confidence', className: 'from-yellow-300 to-orange-400' },
      { href: '/confidence/evaluation-result-student', label: 'Evaluasi Hasil Confidence', className: 'from-emerald-400 to-teal-500' },
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

  const handleBackToInstructions = () => {
    if (!isWeightedStage) return;
    // Find the index of the instructions slide
    const instructionsIndex = introSlides.findIndex(slide => slide.key.includes('instructions'));
    if (instructionsIndex !== -1) {
      setIntroStep(instructionsIndex);
    }
  };

  // Show loading while fetching CMS questions
  if (loadingQuestions && isWeightedStage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <div className="text-white text-xl font-semibold">Memuat soal...</div>
      </div>
    );
  }

  const hasStartedAssessment = answers.some(a => a >= 0);
  const handleAssessmentHome = () => {
    if (hasStartedAssessment && !answeredAll) {
      alert('Selesaikan semua 6 pertanyaan terlebih dahulu sebelum kembali.');
      return;
    }
    router.push('/journey');
  };

  if (isWeightedStage && introStep < introSlides.length) {
    const slide = introSlides[introStep];
    const voiceText = slide.paragraphs.join(' ');
    const isLastSlide = introStep === introSlides.length - 1;
    const isInstructionsSlide = slide.key.includes('instructions');

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70" onClick={handleAssessmentHome} />
        <div className="relative w-full max-w-4xl">
          <div className="bg-gradient-to-b from-yellow-200 via-yellow-300 to-yellow-400 rounded-[28px] overflow-hidden border-4 border-white/70 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-700 drop-shadow">{slide.title}</h3>
              <div className="flex items-center gap-3">
                <div className="[&_svg]:!text-emerald-600 [&_svg:hover]:!text-emerald-700 [&_svg]:!fill-emerald-600">
                  <TextToSpeech text={voiceText} className="hover:scale-105 transition-transform" />
                </div>
                <button
                  onClick={handleAssessmentHome}
                  className="text-emerald-700 hover:text-emerald-900 transition-colors p-1 rounded-full hover:bg-white/20"
                  aria-label="Tutup"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scroll">
              <div className="space-y-3 text-emerald-900 whitespace-pre-line">
                {slide.paragraphs.map((paragraph, idx) => (
                  <p key={`${slide.key}-${idx}`}>{paragraph}</p>
                ))}
              </div>
              
              {/* Buttons di bawah - kanan kiri */}
              <div className="flex justify-between gap-3 pt-4 border-t-2 border-emerald-200">
                <GameButton onClick={handleAssessmentHome}>Home</GameButton>
                <GameButton 
                  onClick={() => {
                    if (isLastSlide || isInstructionsSlide) {
                      // Set ke soal 1 dan skip intro slides
                      setCurrentQuestion(0);
                      setIntroStep(introSlides.length);
                    } else {
                      setIntroStep((prev) => prev + 1);
                    }
                  }} 
                  className="from-green-400 to-green-600"
                >
                  {isLastSlide || isInstructionsSlide ? 'Mulai Soal' : 'Next'}
                </GameButton>
              </div>
            </div>
          </div>
        </div>
      </div>
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

    // Determine category and passed status based on new scoring system
    let category: import('../../../lib/stageContent').ScoreCategory | null = null;
    let passed = false;
    
    if (isWeightedStage) {
      category = scoreToCategory(weightedScore, weightedMaxScore);
      const categoryInfo = getCategoryInfo(category);
      passed = categoryInfo.passed; // Very High atau High = passed
    } else {
      passed = correctCount >= passThreshold;
    }
    
    const percentScore = isWeightedStage
      ? (weightedMaxScore > 0 ? Math.round((weightedScore / weightedMaxScore) * 100) : 0)
      : Math.round((correctCount / mcqQuestions.length) * 100);

    // Save attempt and progress
    setSubmitting(true);
    try {
      await fetch('/api/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          stage,
          answers,
          score: isWeightedStage ? weightedScore : percentScore, // Send total score (0-240) for weighted stages, percent for others
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
    } finally {
      setSubmitting(false);
    }

    const modalPayload: {
      type: 'success' | 'fail';
      correct: number;
      detail?: { totalScore: number; maxScore: number; percent: number; category?: import('../../../lib/stageContent').ScoreCategory };
    } = isWeightedStage
      ? {
          type: passed ? 'success' : 'fail',
          correct: weightedScore,
          detail: {
            totalScore: weightedScore,
            maxScore: weightedMaxScore,
            percent: percentScore,
            category: category || undefined,
          },
        }
      : {
          type: passed ? 'success' : 'fail',
          correct: correctCount,
        };

    setModal(modalPayload);

    // Jika lolos dan weighted stage, otomatis redirect ke diary setelah 3 detik
    if (passed && isWeightedStage && weightedStage) {
      setTimeout(() => {
        setModal(null);
        router.push(`/${weightedStage}/diary?fromAssessment=true`);
      }, 3000); // Tampilkan modal 3 detik, lalu otomatis redirect
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={submitting} text="Menyimpan hasil assessment..." />
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
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg p-6 text-white">
              <p className="text-base font-bold mb-4">
                {currentQuestion + 1}. {weightedItems[currentQuestion]?.q}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {weightedItems[currentQuestion]?.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleChoose(currentQuestion, optIdx)}
                    className={`text-left px-3 py-2 rounded transition-all text-sm relative ${
                      answers[currentQuestion] === optIdx 
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-300 shadow-lg transform scale-105' 
                        : 'bg-white/15 hover:bg-white/25 text-white'
                    }`}
                  >
                    {answers[currentQuestion] === optIdx && (
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white font-bold">✓</span>
                    )}
                    <span className={`block font-semibold ${answers[currentQuestion] === optIdx ? 'ml-6' : ''}`}>
                      {String.fromCharCode(65 + optIdx)}. {opt.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <GameButton onClick={handleBackToInstructions} className="from-gray-400 to-gray-600">
                Kembali ke Instruksi
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-12 sm:pt-24">
              {questions.map((item, qIdx) => (
                <div key={qIdx} className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg p-4 text-white">
                  <p className="text-xs font-semibold mb-3">{qIdx + 1}. {item.q}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(item as MCQ).options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => handleChoose(qIdx, optIdx)}
                        className={`text-left px-3 py-2 rounded transition-all text-xs relative ${
                          answers[qIdx] === optIdx 
                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-300 shadow-lg transform scale-105' 
                            : 'bg-white/15 hover:bg-white/25 text-white'
                        }`}
                      >
                        {answers[qIdx] === optIdx && (
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white font-bold">✓</span>
                        )}
                        <span className={`block ${answers[qIdx] === optIdx ? 'ml-6' : ''}`}>
                          {String.fromCharCode(65 + optIdx)}. {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6">
              <button onClick={handleAssessmentHome} className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600">Home</button>
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
                  {weightedStage ? (
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Mengarahkan ke Catatan Harian...
                      </p>
                      <GameButton 
                        onClick={() => {
                          setModal(null);
                          router.push(`/${weightedStage}/diary?fromAssessment=true`);
                        }} 
                        className="from-yellow-300 to-orange-400"
                      >
                        Lanjut Sekarang
                      </GameButton>
                    </div>
                  ) : (
                    <GameButton onClick={() => router.push('/journey?refresh=true')} className="from-gray-400 to-gray-600">
                      Kembali ke Journey
                    </GameButton>
                  )}
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
              <div className="space-y-3 text-gray-800">
                <p className="font-bold text-lg">Skor total: <span className="text-blue-700">{modal.detail?.totalScore}</span> / <span className="text-gray-600">{modal.detail?.maxScore}</span></p>
                <p className="font-bold text-lg">Persentase: <span className={modal.type === 'success' ? 'text-green-700' : 'text-red-700'}>{modal.detail?.percent}%</span></p>
                {modal.detail?.category && (() => {
                  const categoryInfo = getCategoryInfo(modal.detail.category);
                  return (
                    <>
                      <div className={`p-3 rounded-lg border-2 ${categoryInfo.color}`}>
                        <p className="font-bold text-lg">Kategori: {categoryInfo.label}</p>
                        <p className="font-semibold mt-1">Tindakan: {categoryInfo.action}</p>
                      </div>
                      {!categoryInfo.passed && (
                        <p className="font-semibold text-gray-800 mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          Pilih jawaban yang paling menggambarkan {weightedStage ? weightedPromptMap[weightedStage] : 'dirimu'} untuk meningkatkan nilai.
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <>
                <p className="text-gray-800 font-bold text-lg">Jawaban benar: <span className={modal.type === 'success' ? 'text-green-700' : 'text-red-700'}>{modal.correct}</span> / <span className="text-gray-600">{questions.length}</span></p>
                {modal.type === 'fail' && <p className="text-gray-700 mt-2 font-semibold">Coba ulang atau kembali ke Start untuk belajar lagi.</p>}
              </>
            )}
          </GameModal>
        )}
      </div>
    </div>
    </>
  );
}
