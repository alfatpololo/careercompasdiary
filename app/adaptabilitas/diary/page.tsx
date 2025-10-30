'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameButton } from '../../../components/GameUI';

export default function DiaryForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nama: user?.username || '',
    tanggal: new Date().toISOString().split('T')[0],
    judul: '',
    isi: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...formData
        })
      });

      if (response.ok) {
        alert('Catatan harian berhasil disimpan!');
        router.push('/adaptabilitas/evaluation-process');
      } else {
        alert('Terjadi kesalahan saat menyimpan catatan');
      }
    } catch (error) {
      console.error('Error saving diary:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover'
      }}>
        <div className="bg-white bg-opacity-90 rounded-lg p-8 text-center">
          <p>Login required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      backgroundImage: 'url(/Background_Mulai.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <GameCard className="max-w-5xl w-full">
        <div className="grid md:grid-cols-2 gap-6">
          {/* LEFT PANEL */}
          <div className="flex flex-col justify-center">
            <h2 className="text-4xl font-extrabold text-white drop-shadow mb-3">Catatan Harian</h2>
            <p className="text-white/90 font-semibold mb-4">Tulis pemahamanmu tentang karier setelah sesi Adaptabilitas Karier.</p>
            <ul className="text-white/90 text-sm list-disc ml-5 space-y-1">
              <li>Tulis jujur dengan bahasamu sendiri.</li>
              <li>Contoh: apa yang kamu pelajari, apa rencanamu, tantangan dan solusi.</li>
            </ul>
          </div>

          {/* RIGHT PANEL (FORM) */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[65vh] overflow-auto pr-2">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Nama</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Tanggal</label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({...formData, tanggal: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Judul Catatan</label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({...formData, judul: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Ceritakan pemahamanmu tentang karier itu</label>
                <textarea
                  value={formData.isi}
                  onChange={(e) => setFormData({...formData, isi: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between">
              <GameButton type="button" onClick={() => router.back()} className="from-gray-400 to-gray-600">Cancel</GameButton>
              <GameButton type="submit" className="from-green-400 to-green-600">Submit</GameButton>
            </div>
          </form>
        </div>
      </GameCard>
    </div>
  );
}
