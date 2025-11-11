'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameButton, GameBadge } from '../../../components/GameUI';

const questionText =
  'Jelaskan satu keputusan atau tindakan yang kamu ambil untuk mendekatkan ke tujuanmu?';

const exampleAnswer =
  'Salah satu keputusan penting yang saya ambil untuk mendekatkan diri ke tujuan karier saya adalah mendaftar pada program pelatihan manajemen waktu. Saya menyadari bahwa untuk mencapai sertifikasi manajemen proyek, saya perlu mengelola waktu saya dengan lebih efektif. Dengan mengikuti pelatihan ini, saya belajar teknik-teknik seperti prioritas tugas dan penggunaan alat manajemen waktu, yang membantu saya menyusun rencana harian yang lebih terstruktur. Setelah menerapkan teknik ini, saya mampu menyelesaikan tugas-tugas penting dengan lebih cepat, sehingga memberi saya lebih banyak waktu untuk belajar dan mempersiapkan ujian sertifikasi. Keputusan ini meningkatkan produktivitas saya sekaligus memberi rasa kontrol yang lebih besar terhadap proses karier saya.';

export default function ControlDiary() {
  const router = useRouter();
  const { user } = useAuth();
  const [tanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [jawaban, setJawaban] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const nama = user?.displayName || user?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jawaban.trim()) {
      alert('Silakan tuliskan keputusan atau tindakan yang kamu ambil.');
      return;
    }

    if (!user?.uid) {
      alert('User tidak ditemukan. Silakan login ulang.');
      return;
    }

    setLoading(true);

    try {
      const resp = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          nama,
          tanggal,
          judul: 'Control - Catatan Harian',
          isi: [
            `Pertanyaan: ${questionText}`,
            `Jawaban: ${jawaban.trim()}`,
          ].join('\n\n'),
          stage: 'control',
        }),
      });

      if (!resp.ok) {
        const data = await resp.json();
        alert(data?.message || 'Gagal menyimpan catatan harian.');
        return;
      }

      alert('Catatan harian Control berhasil disimpan! ✅');
      router.push('/control/evaluation-process-student');
    } catch (error) {
      console.error('[Control Diary] Failed to save diary:', error);
      alert('Terjadi kesalahan saat menyimpan catatan.');
    } finally {
      setLoading(false);
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
            Silakan login terlebih dahulu untuk mengisi catatan harian tahap Control.
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between text-white">
          <div>
            <GameBadge className="bg-emerald-500/80 border-white">Stage Control</GameBadge>
            <h1 className="text-3xl font-extrabold drop-shadow mt-2">Catatan Harian Control</h1>
            <p className="text-white/85 font-semibold">
              Tuliskan keputusan yang kamu ambil dan bagaimana keputusan tersebut mendukung rencana kariermu.
            </p>
          </div>
          <GameButton onClick={() => router.push('/control')} className="from-gray-400 to-gray-600">
            Menu Control
          </GameButton>
        </div>

        <GameCard className="bg-gradient-to-br from-emerald-400 to-teal-500">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-extrabold drop-shadow">Petunjuk</h2>
              <p className="text-white/90 font-semibold">
                Jelaskan secara rinci keputusan yang kamu ambil, alasan memilih tindakan tersebut,
                dan dampak yang kamu rasakan terhadap kemajuan kariermu.
              </p>
              <div className="bg-white/15 border-2 border-white/30 rounded-2xl p-4">
                <h3 className="text-lg font-bold mb-2">Contoh Jawaban</h3>
                <p className="text-sm text-white/85 whitespace-pre-line">{exampleAnswer}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Nama</label>
                  <input
                    type="text"
                    value={nama}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl bg-white/90 text-gray-800 border-4 border-white/70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Tanggal</label>
                  <input
                    type="date"
                    value={tanggal}
                    readOnly
                    className="w-full px-3 py-2 rounded-xl bg-white/90 text-gray-800 border-4 border-white/70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">
                  {questionText}
                </label>
                <textarea
                  value={jawaban}
                  onChange={(e) => setJawaban(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
                  placeholder="Tuliskan keputusanmu secara lengkap..."
                  required
                />
              </div>

              <div className="flex justify-between">
                <GameButton
                  type="button"
                  onClick={() => router.back()}
                  className="from-gray-400 to-gray-600"
                  disabled={loading}
                >
                  Cancel
                </GameButton>
                <GameButton
                  type="submit"
                  className="from-yellow-300 to-orange-400"
                  disabled={loading}
                >
                  {loading ? 'Menyimpan...' : 'Simpan Catatan'}
                </GameButton>
              </div>
            </form>
          </div>
        </GameCard>
      </div>
    </div>
  );
}


