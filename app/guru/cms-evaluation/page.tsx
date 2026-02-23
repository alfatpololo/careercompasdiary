'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton, LoadingSpinner } from '../../../components/GameUI';

const EVALUATION_STAGES = ['start', 'concern', 'control', 'curiosity', 'confidence'] as const;
const STAGE_LABELS: Record<string, string> = {
  start: 'START (Mari Mengenal)',
  concern: 'Concern',
  control: 'Control',
  curiosity: 'Curiosity',
  confidence: 'Confidence',
};

type EvalQuestions = { process: string[]; result: string[] };

export default function CMSEvaluation() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedStage, setSelectedStage] = useState<string>('start');
  const [questions, setQuestions] = useState<EvalQuestions>({ process: [], result: [] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      router.push('/login');
      return;
    }

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
        loadQuestions();
      } catch (error) {
        console.error('Error:', error);
        if (active) setChecking(false);
      }
    })();

    return () => { active = false; };
  }, [user, router]);

  useEffect(() => {
    if (!checking) loadQuestions();
  }, [selectedStage, checking]);

  const loadQuestions = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/cms/evaluation?stage=${selectedStage}`);
      const data = await res.json();
      if (data.success && data.data) {
        setQuestions({
          process: data.data.process || [],
          result: data.data.result || [],
        });
      }
    } catch (error) {
      console.error('Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/cms/evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: selectedStage, questions }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Pernyataan evaluasi berhasil disimpan!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(`Error: ${data.error || 'Gagal menyimpan'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const updateStatement = (type: 'process' | 'result', index: number, value: string) => {
    const arr = [...questions[type]];
    arr[index] = value;
    setQuestions({ ...questions, [type]: arr });
  };

  const addStatement = (type: 'process' | 'result') => {
    setQuestions({ ...questions, [type]: [...questions[type], ''] });
  };

  const removeStatement = (type: 'process' | 'result', index: number) => {
    if (confirm('Hapus pernyataan ini?')) {
      const arr = questions[type].filter((_, i) => i !== index);
      setQuestions({ ...questions, [type]: arr });
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundImage: 'url(/Background_Front.png)', backgroundSize: 'cover' }}>
        <LoadingSpinner size="lg" text="Memuat..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundImage: 'url(/Background_Front.png)', backgroundSize: 'cover' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-white">
          <div>
            <GameBadge className="bg-amber-500/90 border-white">CMS Intro Evaluasi</GameBadge>
            <h1 className="text-2xl sm:text-3xl font-extrabold drop-shadow mt-2">
              Edit Pernyataan Evaluasi
            </h1>
            <p className="text-white/90 font-semibold max-w-2xl">
              Masukkan atau sunting pernyataan untuk Evaluasi Proses (Guru) dan Evaluasi Hasil (Siswa) per tahap.
            </p>
          </div>
          <GameButton onClick={() => router.push('/profile')} className="from-gray-400 to-gray-600">
            Kembali ke Profil
          </GameButton>
        </div>

        <div className="flex flex-wrap gap-2">
          {EVALUATION_STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStage(s)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                selectedStage === s ? 'bg-amber-500 text-white' : 'bg-white/80 text-gray-700'
              }`}
            >
              {STAGE_LABELS[s] || s}
            </button>
          ))}
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        {loading ? (
          <GameCard><LoadingSpinner size="md" text="Memuat pernyataan..." /></GameCard>
        ) : (
          <GameCard className="bg-white/95 !text-gray-900 space-y-6">
            {/* Evaluasi Proses (Guru) */}
            <div>
              <h2 className="text-xl font-extrabold mb-3 flex items-center gap-2">
                <GameBadge className="bg-indigo-500/80 !text-white text-xs">Guru BK</GameBadge>
                Evaluasi Proses
              </h2>
              <div className="space-y-2">
                {questions.process.map((stmt, i) => (
                  <div key={`p-${i}`} className="flex gap-2 items-start">
                    <span className="text-sm font-bold text-gray-500 shrink-0 w-6">{i + 1}.</span>
                    <input
                      type="text"
                      value={stmt}
                      onChange={(e) => updateStatement('process', i, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-gray-800"
                      placeholder="Pernyataan evaluasi proses..."
                    />
                    <button
                      onClick={() => removeStatement('process', i)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <GameButton onClick={() => addStatement('process')} className="from-indigo-400 to-indigo-600 text-sm">
                  + Tambah Pernyataan Proses
                </GameButton>
              </div>
            </div>

            {/* Evaluasi Hasil (Siswa) */}
            <div>
              <h2 className="text-xl font-extrabold mb-3 flex items-center gap-2">
                <GameBadge className="bg-emerald-500/80 !text-white text-xs">Siswa</GameBadge>
                Evaluasi Hasil
              </h2>
              <div className="space-y-2">
                {questions.result.map((stmt, i) => (
                  <div key={`r-${i}`} className="flex gap-2 items-start">
                    <span className="text-sm font-bold text-gray-500 shrink-0 w-6">{i + 1}.</span>
                    <input
                      type="text"
                      value={stmt}
                      onChange={(e) => updateStatement('result', i, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-amber-400 focus:outline-none text-gray-800"
                      placeholder="Pernyataan evaluasi hasil..."
                    />
                    <button
                      onClick={() => removeStatement('result', i)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Hapus"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <GameButton onClick={() => addStatement('result')} className="from-emerald-400 to-emerald-600 text-sm">
                  + Tambah Pernyataan Hasil
                </GameButton>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t-2 border-gray-200">
              <GameButton onClick={handleSave} disabled={saving} className="from-amber-500 to-amber-600">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </GameButton>
            </div>
          </GameCard>
        )}
      </div>
    </div>
  );
}
