'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton, LoadingSpinner } from '../../../components/GameUI';

type CaasVariant = 'caas1' | 'caas2';

const VARIANTS: { id: CaasVariant; label: string }[] = [
  { id: 'caas1', label: 'CAAS I (Pretest)' },
  { id: 'caas2', label: 'CAAS II (Posttest)' },
];

type CaasQuestions = { concern: string[]; control: string[]; curiosity: string[]; confidence: string[] };

const DIMENSION_KEYS: { key: keyof CaasQuestions; label: string }[] = [
  { key: 'concern', label: 'Concern (Kepedulian)' },
  { key: 'control', label: 'Control (Kendali)' },
  { key: 'curiosity', label: 'Curiosity (Rasa Ingin Tahu)' },
  { key: 'confidence', label: 'Confidence (Kepercayaan Diri)' },
];

const defaultQuestions: CaasQuestions = {
  concern: ['', '', '', '', '', ''],
  control: ['', '', '', '', '', ''],
  curiosity: ['', '', '', '', '', ''],
  confidence: ['', '', '', '', '', ''],
};

type CaasData = {
  introTitle: string;
  introContent: string;
  instructionTitle: string;
  instructionContent: string;
  questions: CaasQuestions;
};

export default function CMSCaas() {
  const router = useRouter();
  const { user } = useAuth();
  const [selected, setSelected] = useState<CaasVariant>('caas1');
  const [data, setData] = useState<CaasData>({
    introTitle: '',
    introContent: '',
    instructionTitle: '',
    instructionContent: '',
    questions: {
      concern: ['', '', '', '', '', ''],
      control: ['', '', '', '', '', ''],
      curiosity: ['', '', '', '', '', ''],
      confidence: ['', '', '', '', '', ''],
    },
  });
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
        loadData();
      } catch (error) {
        console.error('Error:', error);
        if (active) setChecking(false);
      }
    })();

    return () => { active = false; };
  }, [user, router]);

  useEffect(() => {
    if (!checking) loadData();
  }, [selected, checking]);

  const loadData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/cms/caas?stage=${selected}`);
      const json = await res.json();
      if (json.success && json.data) {
        const q = json.data.questions;
        const questions: CaasQuestions = {
          concern: Array.isArray(q?.concern) ? q.concern.slice(0, 6) : defaultQuestions.concern,
          control: Array.isArray(q?.control) ? q.control.slice(0, 6) : defaultQuestions.control,
          curiosity: Array.isArray(q?.curiosity) ? q.curiosity.slice(0, 6) : defaultQuestions.curiosity,
          confidence: Array.isArray(q?.confidence) ? q.confidence.slice(0, 6) : defaultQuestions.confidence,
        };
        ['concern', 'control', 'curiosity', 'confidence'].forEach((k) => {
          const key = k as keyof CaasQuestions;
          while (questions[key].length < 6) questions[key].push('');
        });
        setData({
          introTitle: json.data.introTitle ?? '',
          introContent: json.data.introContent ?? '',
          instructionTitle: json.data.instructionTitle ?? '',
          instructionContent: json.data.instructionContent ?? '',
          questions,
        });
      }
    } catch (error) {
      console.error('Error loading CAAS:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/cms/caas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: selected,
          ...data,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setMessage('CAAS berhasil disimpan!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(`Error: ${json.error || 'Gagal menyimpan'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{
      backgroundImage: 'url(/Background_Front.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <GameButton onClick={() => router.push('/profile')} className="from-gray-500 to-gray-600">
            ← Profil
          </GameButton>
          <GameBadge className="bg-amber-500/90 border-white">CMS CAAS I & II</GameBadge>
        </div>

        <GameCard className="bg-white/95 border-4 border-white/80 shadow-xl">
          <h1 className="text-2xl font-extrabold text-gray-800 mb-2">CMS CAAS I & CAAS II</h1>
          <p className="text-gray-600 text-sm mb-4">
            Edit intro dan petunjuk pengisian untuk Pretest (CAAS I) dan Posttest (CAAS II).
          </p>

          {/* Tab CAAS 1 / CAAS 2 */}
          <div className="flex gap-2 mb-6">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selected === v.id ? 'bg-amber-500 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Intro</label>
                <input
                  type="text"
                  value={data.introTitle}
                  onChange={(e) => setData((d) => ({ ...d, introTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Contoh: Selamat Datang! 🌟"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Isi Intro (paragraf dipisah baris baru)</label>
                <textarea
                  value={data.introContent}
                  onChange={(e) => setData((d) => ({ ...d, introContent: e.target.value }))}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                  placeholder="Teks yang tampil di layar pertama kuesioner..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Petunjuk Pengisian</label>
                <input
                  type="text"
                  value={data.instructionTitle}
                  onChange={(e) => setData((d) => ({ ...d, instructionTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Contoh: Petunjuk Pengisian 📋"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Isi Petunjuk (skala jawaban, 4 kolom, dll)</label>
                <textarea
                  value={data.instructionContent}
                  onChange={(e) => setData((d) => ({ ...d, instructionContent: e.target.value }))}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-mono text-sm"
                  placeholder="Teks petunjuk pengisian..."
                />
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Pertanyaan CAAS (6 per dimensi)</h3>
                {DIMENSION_KEYS.map(({ key, label }) => (
                  <div key={key} className="mb-6">
                    <h4 className="text-sm font-semibold text-amber-800 mb-2">{label}</h4>
                    <div className="space-y-2">
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <input
                          key={i}
                          type="text"
                          value={data.questions[key][i] ?? ''}
                          onChange={(e) => {
                            const next = [...(data.questions[key] || [])];
                            while (next.length <= i) next.push('');
                            next[i] = e.target.value;
                            setData((d) => ({
                              ...d,
                              questions: { ...d.questions, [key]: next.slice(0, 6) },
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                          placeholder={`Pertanyaan ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <GameButton onClick={handleSave} disabled={saving} className="from-amber-500 to-amber-600">
                {saving ? 'Menyimpan...' : 'Simpan ' + (selected === 'caas1' ? 'CAAS I' : 'CAAS II')}
              </GameButton>
            </div>
          )}
        </GameCard>
      </div>
    </div>
  );
}
