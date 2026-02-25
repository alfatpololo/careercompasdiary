'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { GameButton, LoadingSpinner } from '../../components/GameUI';
import { jsPDF } from 'jspdf';

const CERT_IMAGE_PATH = '/WhatsApp%20Image%202026-02-23%20at%2012.36.10.jpeg';

export default function SertifikatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

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
          const name = data?.data?.username || data?.data?.email || user.displayName || user.email || 'Peserta';
          if (active) setUserName(name);
        } else {
          if (active) setUserName(user.displayName || user.email || 'Peserta');
        }
      } catch {
        if (active) setUserName(user.displayName || user.email || 'Peserta');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user, router]);

  const onImageLoad = useCallback(() => {}, []);

  const handleDownloadImage = useCallback(async () => {
    if (!userName) return;
    setDownloading(true);
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Gagal memuat gambar'));
        img.src = CERT_IMAGE_PATH;
      });

      const scale = 2;
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 600;
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setDownloading(false);
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, w, h);

      const nameY = h * 0.32;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1e3a5f';
      const fontSize = Math.min(48, (w / 800) * 48);
      ctx.font = `bold ${fontSize}px "Times New Roman", Georgia, serif`;
      ctx.fillText(userName, w / 2, nameY);

      const link = document.createElement('a');
      link.download = `Sertifikat-Penghargaan-${userName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
      alert('Gagal mengunduh. Coba lagi.');
    } finally {
      setDownloading(false);
    }
  }, [userName]);

  const handleDownloadPdf = useCallback(async () => {
    if (!userName) return;
    setDownloading(true);
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Gagal memuat gambar'));
        img.src = CERT_IMAGE_PATH;
      });

      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 600;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setDownloading(false);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1e3a5f';
      const fontSize = Math.min(48, (w / 800) * 48);
      ctx.font = `bold ${fontSize}px "Times New Roman", Georgia, serif`;
      ctx.fillText(userName, w / 2, h * 0.32);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({
        orientation: w > h ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [w * 0.264583, h * 0.264583],
      });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, w * 0.264583, h * 0.264583);
      pdf.save(`Sertifikat-Penghargaan-${userName.replace(/\s+/g, '-')}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Gagal mengunduh PDF. Coba lagi.');
    } finally {
      setDownloading(false);
    }
  }, [userName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white drop-shadow">Sertifikat Penghargaan</h1>
          <div className="flex gap-2">
            <GameButton onClick={() => router.push('/results/prepost?view=posttest')} className="from-gray-500 to-gray-600">
              ← Hasil
            </GameButton>
            <GameButton onClick={handleDownloadImage} disabled={downloading} className="from-emerald-500 to-emerald-600">
              {downloading ? 'Mengunduh...' : '📥 Download PNG'}
            </GameButton>
            <GameButton onClick={handleDownloadPdf} disabled={downloading} className="from-blue-500 to-blue-600">
              {downloading ? 'Mengunduh...' : '📄 Download PDF'}
            </GameButton>
          </div>
        </div>

        <div className="bg-white/95 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col items-center">
          <p className="text-gray-600 text-sm mb-4">
            Diberikan kepada peserta yang telah menyelesaikan kegiatan Career Compass Diary (CCD).
          </p>
          <div className="relative w-full max-w-2xl mx-auto">
            <img
              ref={imgRef}
              src={CERT_IMAGE_PATH}
              alt="Sertifikat Penghargaan"
              className="w-full h-auto rounded-lg shadow-lg"
              onLoad={onImageLoad}
              style={{ maxHeight: '85vh' }}
            />
            <div
              className="absolute left-0 right-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ top: '30%', transform: 'translateY(-50%)' }}
            >
              <p className="text-sm font-semibold text-[#1e3a5f] mb-1">Diberikan kepada</p>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1e3a5f] text-center px-4 break-words">
                {userName}
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4">Gunakan tombol di atas untuk mengunduh sertifikat dengan nama Anda.</p>
        </div>
      </div>
    </div>
  );
}
