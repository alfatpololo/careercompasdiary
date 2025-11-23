'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton, LoadingSpinner } from '../../../components/GameUI';
import { weightedStageOrder, weightedAssessment, type WeightedStageId } from '../../../lib/stageContent';

export default function CMSQuiz() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedStage, setSelectedStage] = useState<WeightedStageId>('concern');
  const [questions, setQuestions] = useState<Array<{ q: string; options: Array<{ text: string; score: number }> }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      router.push('/login');
      return;
    }

    // Check if user is guru
    let active = true;
    (async () => {
      try {
        const userRes = await fetch(`/api/users?userId=${encodeURIComponent(user.uid)}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.data?.role !== 'guru') {
            router.push('/profile');
            return;
          }
        }
        if (active) setChecking(false);
        loadQuizQuestions();
      } catch (error) {
        console.error('Error checking user:', error);
        if (active) setChecking(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, router]);

  useEffect(() => {
    if (!checking) {
      loadQuizQuestions();
    }
  }, [selectedStage, checking]);

  const loadQuizQuestions = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/cms/quiz?stage=${selectedStage}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setQuestions(data.data);
        } else {
          const defaultQuestions = weightedAssessment[selectedStage];
          setQuestions(defaultQuestions.map(q => ({ ...q })));
        }
      } else {
        const defaultQuestions = weightedAssessment[selectedStage];
        setQuestions(defaultQuestions.map(q => ({ ...q })));
      }
    } catch (error) {
      console.error('Error loading quiz questions:', error);
      const defaultQuestions = weightedAssessment[selectedStage];
      setQuestions(defaultQuestions.map(q => ({ ...q })));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/cms/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: selectedStage, questions }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Quiz questions berhasil disimpan!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(`Error: ${data.error || 'Gagal menyimpan'}`);
      }
    } catch (error) {
      console.error('Error saving quiz questions:', error);
      setMessage('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (qIndex: number, field: 'q' | 'options', value: string | Array<{ text: string; score: number }>) => {
    const newQuestions = [...questions];
    newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, optIndex: number, field: 'text' | 'score', value: string | number) => {
    const newQuestions = [...questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[optIndex] = { ...newOptions[optIndex], [field]: value };
    newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        q: '',
        options: [
          { text: '', score: 10 },
          { text: '', score: 20 },
          { text: '', score: 30 },
          { text: '', score: 40 },
        ],
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (confirm('Hapus pertanyaan ini?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <LoadingSpinner size="lg" text="Memuat..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{
        backgroundImage: 'url(/Background_Front.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <GameButton onClick={() => router.push('/')} className="from-blue-500 to-blue-600">
            ← Kembali ke Home
          </GameButton>
        </div>
        <GameCard className="bg-white/90 border-4 border-white/70 space-y-4 text-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">CMS Edit Quiz</h2>
            <GameBadge className="bg-orange-500/80 border-white">Content Management</GameBadge>
          </div>

          <div className="flex gap-2 mb-4">
            {weightedStageOrder.map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  selectedStage === stage
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </button>
            ))}
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-auto pr-2">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border-2 border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Pertanyaan {qIndex + 1}</h3>
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Pertanyaan</label>
                    <input
                      type="text"
                      value={question.q || ''}
                      onChange={(e) => updateQuestion(qIndex, 'q', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Pilihan Jawaban</label>
                    {question.options?.map((option: { text: string; score: number }, optIndex: number) => (
                      <div key={optIndex} className="mb-2 flex gap-2">
                        <input
                          type="text"
                          value={option.text || ''}
                          onChange={(e) => updateOption(qIndex, optIndex, 'text', e.target.value)}
                          placeholder={`Jawaban ${String.fromCharCode(65 + optIndex)}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded"
                        />
                        <input
                          type="number"
                          value={option.score || 0}
                          onChange={(e) => updateOption(qIndex, optIndex, 'score', parseInt(e.target.value) || 0)}
                          placeholder="Score"
                          className="w-20 px-3 py-2 border border-gray-300 rounded"
                          min="0"
                          max="40"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={addQuestion}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                + Tambah Pertanyaan
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <GameButton onClick={handleSave} disabled={saving} className="from-green-500 to-emerald-600">
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </GameButton>
            <GameButton onClick={loadQuizQuestions} className="from-gray-400 to-gray-600">
              Reset
            </GameButton>
          </div>
        </GameCard>
      </div>
    </div>
  );
}


