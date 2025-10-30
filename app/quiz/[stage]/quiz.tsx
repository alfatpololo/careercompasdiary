'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameModal, GameButton } from '../../../components/GameUI';

interface QuizData {
  concern: number[];
  control: number[];
  curiosity: number[];
  confidence: number[];
}

interface IntroPopupProps {
  onNext: () => void;
  onClose: () => void;
}

function IntroPopup({ onNext, onClose }: IntroPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Selamat Datang! 🌟
        </h2>
        
        <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
          <p>
            Halo, teman-teman! 👋😊 Kami ingin mengajak kalian untuk berpartisipasi dalam pengisian kuesioner ini. 
            Kuesioner ini dirancang khusus untuk memahami bagaimana kalian merencanakan masa depan dan mengembangkan potensi diri. ✨
          </p>
          
          <p>
            Jawablah setiap pertanyaan dengan jujur sesuai dengan apa yang kalian rasakan dan pikirkan. Tidak ada jawaban benar atau salah yang terpenting adalah menjadi diri sendiri! ✅
          </p>
          
          <p>
            Kami sangat menghargai waktu dan kejujuran kalian. Hasil dari kuesioner ini akan digunakan untuk tujuan penelitian dan pengembangan, tanpa ada kepentingan lain. Jadi, yuk, bantu kami dengan mengisi kuesioner ini secara santai dan sesuai dengan jati diri kalian! 🚀💡
          </p>
          
          <p>
            Terima kasih banyak atas partisipasinya! Semoga langkah kecil ini bisa membantu kalian memahami dan merancang masa depan yang lebih cerah. 🌟💪
          </p>
          
          <p className="font-semibold text-blue-600 mt-4">
            Silakan isi setiap pertanyaan dengan jujur dan sepenuh hati. Tulis jawaban yang benar-benar mencerminkan dirimu sendiri, sesuai dengan pengalaman, pemikiran, dan perasaanmu selama ini. Tidak ada jawaban yang salah atau benar yang paling penting adalah jawaban itu datang dari dirimu sendiri, bukan karena ingin terlihat baik atau meniru orang lain.
          </p>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </button>
          <button
            onClick={onNext}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function Instructions({ onNext, onClose }: IntroPopupProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Petunjuk Pengisian 📋
        </h2>
        
        <div className="space-y-6 text-gray-700">
          <p className="text-lg">
            Setiap orang menggunakan kekuatan yang berbeda-beda dalam membangun karirnya. Tidak ada orang yang hebat dalam segala hal, setiap orang lebih kuat dalam beberapa hal dibanding dalam hal-hal lainnya. Silahkan anda tetapkan seberapa kuat anda mengembangkan kemampuan-kemampuan di bawah ini menggunakan skala berikut dengan memberikan tanda lingkaran pada nomor yang sesuai.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3">Berikut adalah keterangan jawaban:</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mr-2">5</span>
                <span className="font-semibold">Paling kuat (PK)</span>
              </div>
              <div className="flex items-center">
                <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-2">4</span>
                <span className="font-semibold">Sangat kuat (SK)</span>
              </div>
              <div className="flex items-center">
                <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold mr-2">3</span>
                <span className="font-semibold">Kuat (K)</span>
              </div>
              <div className="flex items-center">
                <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-2">2</span>
                <span className="font-semibold">Cukup kuat (CK)</span>
              </div>
              <div className="flex items-center">
                <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold mr-2">1</span>
                <span className="font-semibold">Tidak kuat (TK)</span>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">Selanjutnya, TERDAPAT 4 KOLOM yang akan anda isi dengan jawaban yang benar-benar mencerminkan pengalaman dan kondisi nyata Anda:</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Career concern</li>
              <li>Career control</li>
              <li>Career curiosity</li>
              <li>Career confidence</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </button>
          <button
            onClick={onNext}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
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

  const stageThresholds: Record<'concern'|'control'|'curiosity'|'confidence', number> = {
    concern: 18,      // minimal total 18 dari 6 soal (rata-rata 3)
    control: 18,
    curiosity: 18,
    confidence: 18,
  };

  async function saveStageAttempt(stage: keyof QuizData, stageScore: number, passed: boolean) {
    try {
      await fetch('/api/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          stage,
          answers: answers[stage],
          score: stageScore,
          passed,
        })
      });
    } catch (e) {
      console.error('Failed to save stage attempt', e);
    }
  }

  async function updateUserProgress(stage: keyof QuizData, score: number, completed: boolean) {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          levelId: stage,
          score,
          completed
        })
      });
    } catch (e) {
      console.error('Failed to update user progress', e);
    }
  }

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
    // If not fully answered, guard
    const stageAnswers = answers[currentStage] || [];
    if (stageAnswers.length !== 6) return;

    // Calculate score for this stage
    const stageScore = stageAnswers.reduce((a, b) => a + b, 0);
    const threshold = currentStage in stageThresholds ? stageThresholds[currentStage as keyof typeof stageThresholds] : 0;
    const passed = stageScore >= threshold;

    // Save attempt to DB
    await saveStageAttempt(currentStage as keyof QuizData, stageScore, passed);
    await updateUserProgress(currentStage as keyof QuizData, stageScore, passed);

    if (!passed) {
      setStageMessage(`Skor kamu ${stageScore}. Minimal ${threshold} untuk lolos. Coba lagi ya!`);
      // Reset answers for this stage only
      setAnswers(prev => ({ ...prev, [currentStage]: [] }));
      return; // stay on same stage
    }

    // Clear any message
    setStageMessage('');

    // Move to next quiz stage without showing results until the end
    const stageOrder = ['concern', 'control', 'curiosity', 'confidence'];
    const currentStageIndex = stageOrder.indexOf(currentStage);

    if (currentStageIndex < 3) {
      const nextStage = stageOrder[currentStageIndex + 1] as 'control' | 'curiosity' | 'confidence';
      setCurrentStage(nextStage);
    } else {
      setCurrentStage('results');
    }
  };

  const handleNextAfterResults = async () => {
    if (!user) return;
    
    const { scores, total, percent, category } = calculateResults();
    
    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          answers,
          scores,
          total,
          percent,
          category
        }),
      });

      if (response.ok) {
        // After saving, go to adaptabilitas
        router.push('/adaptabilitas');
      } else {
        alert('Terjadi kesalahan saat menyimpan hasil');
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
      alert('Terjadi kesalahan saat menyimpan hasil');
    }
  };

  const calculateResults = () => {
    const scores = {
      concern: answers.concern.reduce((a, b) => a + b, 0),
      control: answers.control.reduce((a, b) => a + b, 0),
      curiosity: answers.curiosity.reduce((a, b) => a + b, 0),
      confidence: answers.confidence.reduce((a, b) => a + b, 0)
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

          <div className="flex justify-between mt-8">
            <button
              onClick={handleHome}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Home
            </button>
            <button
              onClick={handleNextAfterResults}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
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

  const currentQuestions = questions[currentStage];
  const stageAnswers = answers[currentStage] || [];

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
            disabled={stageAnswers.length !== 6}
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
  concern: [
    { q: 'Langkah pertama paling tepat untuk mulai merencanakan karier?', options: ['Menunggu kesempatan datang', 'Menyusun tujuan jangka pendek dan panjang', 'Mengumpulkan sertifikat secara acak', 'Mengabaikan minat pribadi'], correct: 1 },
    { q: 'Aktivitas paling mendukung kepedulian karier?', options: ['Bermain game sepanjang hari', 'Refleksi masa depan 5–10 tahun', 'Mengikuti tren tanpa rencana', 'Menunda keputusan'], correct: 1 },
    { q: 'Pilihan hari ini berpengaruh pada masa depan karena?', options: ['Tidak ada pengaruh', 'Menentukan keterampilan & jalur belajar', 'Hanya urusan guru', 'Ditentukan teman'], correct: 1 },
    { q: 'Contoh langkah konkret concern?', options: ['Membuat rencana belajar mingguan', 'Scroll media sosial', 'Bolos sekolah', 'Acak jurusan'], correct: 0 },
    { q: 'Alat bantu untuk memetakan tujuan?', options: ['SWOT & timeline target', 'Gacha', 'Chat random', 'Spam tugas'], correct: 0 },
    { q: 'Dokumen untuk merencanakan karier?', options: ['Learning plan', 'Surat izin', 'Kwitansi', 'Form kosong'], correct: 0 },
  ],
  control: [
    { q: 'Sikap kontrol karier yang benar?', options: ['Mengandalkan orang lain', 'Mengambil keputusan mandiri & bertanggung jawab', 'Menunda semua hal', 'Mengikuti mayoritas'], correct: 1 },
    { q: 'Contoh kontrol waktu yang baik?', options: ['To-do list prioritas', 'Begadang tiap hari', 'Menunggu mood', 'Menolak semua tugas'], correct: 0 },
    { q: 'Jika ada distraksi teman?', options: ['Ikut saja', 'Tetap pada rencana', 'Marah', 'Menyerah'], correct: 1 },
    { q: 'Evaluasi keputusan dilakukan?', options: ['Berkala sesuai target', 'Tidak perlu', 'Saat ujian saja', 'Hanya saat diminta'], correct: 0 },
    { q: 'Tanda punya kontrol yang baik?', options: ['Konsisten eksekusi rencana', 'Gonta-ganti tujuan', 'Banyak alasan', 'Menghindar'], correct: 0 },
    { q: 'Respon pada kegagalan?', options: ['Salahkan orang lain', 'Refleksi & perbaiki strategi', 'Putus asa', 'Diam'], correct: 1 },
  ],
  curiosity: [
    { q: 'Cara mengeksplorasi profesi?', options: ['Wawancara alumni/kunjungan industri', 'Tidur siang', 'Spam email', 'Menutup diri'], correct: 0 },
    { q: 'Sebelum memilih jurusan?', options: ['Bandingkan beberapa jalur alternatif', 'Pilih acak', 'Ikut teman', 'Tidak perlu info'], correct: 0 },
    { q: 'Sikap ingin tahu ditunjukkan dengan?', options: ['Bertanya ke praktisi', 'Diam saja', 'Takut tanya', 'Menghindari info'], correct: 0 },
    { q: 'Aktivitas yang menumbuhkan curiosity?', options: ['Webinar/kelas singkat', 'Main terus', 'Gosip', 'AFK'], correct: 0 },
    { q: 'Alasan penting eksplorasi?', options: ['Menemukan cocoknya minat & bakat', 'Biar gaya', 'Ikut-ikutan', 'Biar trending'], correct: 0 },
    { q: 'Contoh praktik curiosity di sekolah?', options: ['Ikut ekstra relevan', 'Bolak-balik kantin', 'Skip tugas', 'Acak club'], correct: 0 },
  ],
  confidence: [
    { q: 'Percaya diri dibangun dengan?', options: ['Latihan & pengalaman kecil', 'Menunggu aja', 'Membandingkan diri', 'Menyerah'], correct: 0 },
    { q: 'Jika dapat tugas presentasi?', options: ['Siapkan & berlatih', 'Tidak usah latihan', 'Kabur', 'Menunda'], correct: 0 },
    { q: 'Saat hambatan muncul?', options: ['Cari solusi', 'Marah', 'Menghindar', 'Menyalahkan'], correct: 0 },
    { q: 'Belajar skill baru?', options: ['Percaya bisa belajar bertahap', 'Tidak mungkin', 'Tunggu bakat', 'Serah'], correct: 0 },
    { q: 'Indikator confidence meningkat?', options: ['Berani ambil peran', 'Mengecilkan diri', 'Pasif', 'Menolak semua'], correct: 0 },
    { q: 'Cara menjaga konsistensi?', options: ['Target kecil harian', 'Acak jadwal', 'Ikut mood', 'Tanpa catatan'], correct: 0 },
  ],
};

export function AssessmentComponent({ stage }: { stage: 'concern'|'control'|'curiosity'|'confidence' }) {
  const router = useRouter();
  const { user } = useAuth();
  const questions = assessmentBank[stage];
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [message, setMessage] = useState<string>('');
  const [modal, setModal] = useState<null | { type: 'success' | 'fail'; correct: number }>(null);
  const passThreshold = 4; // minimal benar 4/6

  const answeredAll = answers.every(a => a >= 0);

  const handleChoose = (qIdx: number, optIdx: number) => {
    const copy = [...answers];
    copy[qIdx] = optIdx;
    setAnswers(copy);
  };

  const submit = async () => {
    if (!answeredAll || !user) return;
    const correctCount = answers.reduce((sum, a, idx) => sum + (a === questions[idx].correct ? 1 : 0), 0);
    const passed = correctCount >= passThreshold;

    // Save attempt and progress
    try {
      await fetch('/api/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          stage,
          answers,
          score: correctCount,
          passed,
        }),
      });
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, levelId: stage, score: correctCount, completed: passed })
      });
    } catch (e) {
      console.error(e);
    }

    if (passed) {
      setModal({ type: 'success', correct: correctCount });
    } else {
      setModal({ type: 'fail', correct: correctCount });
    }
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

        <div className="grid grid-cols-3 gap-3 pt-24">
          {questions.map((item, qIdx) => (
            <div key={qIdx} className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg p-4 text-white">
              <p className="text-xs font-semibold mb-3">{qIdx + 1}. {item.q}</p>
              <div className="space-y-2">
                {item.options.map((opt, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleChoose(qIdx, optIdx)}
                    className={`w-full text-left px-3 py-2 rounded bg-white/15 hover:bg-white/25 transition-colors text-xs ${answers[qIdx] === optIdx ? 'ring-2 ring-white' : ''}`}
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

        {message && <div className="text-center mt-3 text-yellow-200 font-semibold">{message}</div>}

        {modal && (
          <GameModal
            open={true}
            onClose={() => setModal(null)}
            title={modal.type === 'success' ? 'Congrats! 🎉' : 'Belum Lulus ⚠️'}
            right={
              modal.type === 'success' ? (
                <div className="flex flex-col gap-3">
                  <GameButton onClick={() => router.push('/journey')}>Home</GameButton>
                  <GameButton onClick={() => { const order = ['concern','control','curiosity','confidence'] as const; const idx = order.indexOf(stage); setModal(null); if (idx < order.length - 1) router.push(`/quiz/${order[idx+1]}?mode=assessment`); else router.push('/journey'); }} className="from-green-400 to-green-600">Lanjut</GameButton>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <GameButton onClick={() => { setModal(null); setAnswers(Array(questions.length).fill(-1)); }} className="from-blue-400 to-blue-600">Ulang Stage</GameButton>
                  <GameButton onClick={() => router.push('/journey')}>Home</GameButton>
                </div>
              )
            }
          >
            <p className="text-emerald-900 font-bold">Jawaban benar: {modal.correct} / {questions.length}</p>
            {modal.type === 'fail' && <p className="text-emerald-900 mt-2 font-semibold">Coba ulang atau kembali ke Start untuk belajar lagi.</p>}
          </GameModal>
        )}
      </div>
    </div>
  );
}
