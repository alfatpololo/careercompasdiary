'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton, LoadingSpinner } from '../../../components/GameUI';

type UserDoc = {
  id: string;
  username?: string;
  email?: string;
  role?: 'guru' | 'siswa';
  phone?: string;
  namaSekolah?: string;
  alamat?: string;
  createdAt?: unknown;
};

function formatDate(value?: unknown): string {
  if (!value) return '-';
  if (typeof value === 'string') {
    try {
      return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return value;
    }
  }
  return String(value);
}

function Field({ label, value, span = false }: { label: string; value?: string | number | null; span?: boolean }) {
  return (
    <div className={span ? 'sm:col-span-2' : ''}>
      <p className="text-xs text-gray-500 mb-1 uppercase font-bold">{label}</p>
      <div className="px-3 py-2 bg-white/70 rounded-xl border border-white/60 text-gray-800">
        {value || '-'}
      </div>
    </div>
  );
}

export default function BiodataGuru() {
  const router = useRouter();
  const { user } = useAuth();
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      router.push('/login');
      return;
    }

    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/users?userId=${encodeURIComponent(user.uid)}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            const userData = data.data as UserDoc;
            if (userData.role !== 'guru') {
              router.push('/profile');
              return;
            }
            setUserDoc(userData);
          }
        }
      } catch (error) {
        console.error('Error loading biodata:', error);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <LoadingSpinner size="lg" text="Memuat biodata..." fullScreen={false} />
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <GameButton onClick={() => router.push('/')} className="from-blue-500 to-blue-600">
            ← Kembali ke Home
          </GameButton>
        </div>
        <GameCard className="bg-white/90 border-4 border-white/70 space-y-4 text-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">Biodata Guru BK / Konselor</h2>
            <GameBadge className="bg-indigo-500/80 border-white">Identitas</GameBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
            <Field label="Nama Lengkap" value={userDoc?.username} />
            <Field label="Email" value={userDoc?.email} />
            <Field label="Peran" value="Guru BK / Konselor" />
            <Field label="No. WA" value={userDoc?.phone} />
            <Field label="Instansi" value={userDoc?.namaSekolah} span />
            <Field label="Alamat" value={userDoc?.alamat} span />
            <Field label="Terdaftar Pada" value={formatDate(userDoc?.createdAt)} span />
          </div>
        </GameCard>
      </div>
    </div>
  );
}

