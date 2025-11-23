'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton, LoadingSpinner } from '../../../components/GameUI';

type DeveloperProfile = {
  name: string;
  university: string;
  email: string;
  address: string;
  major: string;
  position: string;
  whatsapp: string;
};

const defaultDevelopers: DeveloperProfile[] = [
  {
    name: 'Drs. Ahmad Syahputra, M.Pd',
    university: 'Universitas Negeri Bandung',
    email: 'ahmad.syahputra@smk.sch.id',
    address: 'Jl. Melati No. 21, Bandung',
    major: 'Bimbingan dan Konseling',
    position: 'Guru BK Utama',
    whatsapp: '+62 812-3456-7890',
  },
  {
    name: 'Sri Wulandari, S.Pd',
    university: 'Universitas Negeri Malang',
    email: 'sri.wulandari@smk.sch.id',
    address: 'Jl. Kenanga No. 45, Malang',
    major: 'Psikologi Pendidikan',
    position: 'Kepala Program Karier',
    whatsapp: '+62 813-5678-1234',
  },
  {
    name: 'Agus Pratama, S.Kom',
    university: 'Universitas Pendidikan Indonesia',
    email: 'agus.pratama@smk.sch.id',
    address: 'Jl. Cempaka No. 12, Cimahi',
    major: 'Teknologi Pendidikan',
    position: 'Pengembang Media Gamifikasi',
    whatsapp: '+62 811-9988-7766',
  },
];

export default function CMSDevelopers() {
  const router = useRouter();
  const { user } = useAuth();
  const [developers, setDevelopers] = useState<DeveloperProfile[]>(defaultDevelopers);
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
        loadDevelopers();
      } catch (error) {
        console.error('Error checking user:', error);
        if (active) setChecking(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, router]);

  const loadDevelopers = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/cms/developers');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          setDevelopers(data.data);
        } else {
          // Use default if no data found
          setDevelopers(defaultDevelopers);
        }
      } else {
        // Fallback to default
        setDevelopers(defaultDevelopers);
      }
    } catch (error) {
      console.error('Error loading developers:', error);
      setDevelopers(defaultDevelopers);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/cms/developers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ developers }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Tim pengembang berhasil disimpan!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(`Error: ${data.error || 'Gagal menyimpan'}`);
      }
    } catch (error) {
      console.error('Error saving developers:', error);
      setMessage('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const updateDeveloper = (index: number, field: keyof DeveloperProfile, value: string) => {
    const newDevelopers = [...developers];
    newDevelopers[index] = { ...newDevelopers[index], [field]: value };
    setDevelopers(newDevelopers);
  };

  const addDeveloper = () => {
    setDevelopers([
      ...developers,
      {
        name: '',
        university: '',
        email: '',
        address: '',
        major: '',
        position: '',
        whatsapp: '',
      },
    ]);
  };

  const removeDeveloper = (index: number) => {
    if (confirm('Hapus anggota tim ini?')) {
      setDevelopers(developers.filter((_, i) => i !== index));
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
            <h2 className="text-2xl font-extrabold">CMS Tim Pengembang</h2>
            <GameBadge className="bg-purple-500/80 border-white">Content Management</GameBadge>
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
              {developers.map((dev, index) => (
                <div key={index} className="border-2 border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Anggota Tim {index + 1}</h3>
                    <button
                      onClick={() => removeDeveloper(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Nama</label>
                      <input
                        type="text"
                        value={dev.name}
                        onChange={(e) => updateDeveloper(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Nama lengkap"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Posisi/Jabatan</label>
                      <input
                        type="text"
                        value={dev.position}
                        onChange={(e) => updateDeveloper(index, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Posisi/jabatan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Universitas</label>
                      <input
                        type="text"
                        value={dev.university}
                        onChange={(e) => updateDeveloper(index, 'university', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Nama universitas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Jurusan</label>
                      <input
                        type="text"
                        value={dev.major}
                        onChange={(e) => updateDeveloper(index, 'major', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Jurusan/Program studi"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">Email</label>
                      <input
                        type="email"
                        value={dev.email}
                        onChange={(e) => updateDeveloper(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={dev.whatsapp}
                        onChange={(e) => updateDeveloper(index, 'whatsapp', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="+62 812-3456-7890"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-1">Alamat</label>
                      <input
                        type="text"
                        value={dev.address}
                        onChange={(e) => updateDeveloper(index, 'address', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                        placeholder="Alamat lengkap"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addDeveloper}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                + Tambah Anggota Tim
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <GameButton onClick={handleSave} disabled={saving} className="from-green-500 to-emerald-600">
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </GameButton>
            <GameButton onClick={loadDevelopers} className="from-gray-400 to-gray-600">
              Reset
            </GameButton>
          </div>
        </GameCard>
      </div>
    </div>
  );
}

