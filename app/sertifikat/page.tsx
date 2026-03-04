'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { GameButton, LoadingSpinner } from '../../components/GameUI';
import { jsPDF } from 'jspdf';

const CERT_IMAGE_PATH = '/WhatsApp%20Image%202026-02-23%20at%2012.36.10.jpeg';

/** Wrap nama panjang jadi beberapa baris yang muat di maxWidth; tiap baris tetap bisa di-center. */
function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.trim().split(/\s+/);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    const m = ctx.measureText(test);
    if (m.width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Gambar nama di canvas: multi-baris, horizontal & vertikal di tengah. */
function drawCenteredName(
  ctx: CanvasRenderingContext2D,
  name: string,
  centerX: number,
  centerY: number,
  maxLineWidth: number,
  fontSize: number
) {
  ctx.font = `bold ${fontSize}px "Times New Roman", Georgia, serif`;
  ctx.fillStyle = '#1e3a5f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = wrapTextLines(ctx, name, maxLineWidth);
  const lineHeight = fontSize * 1.25;
  const totalHeight = (lines.length - 1) * lineHeight;
  const startY = centerY - totalHeight / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * lineHeight);
  });
}

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

      // Nama multi-baris tetap di tengah (horizontal & vertikal)
      const nameY = h * 0.47;
      const fontSize = Math.min(44, (w / 800) * 44);
      const maxLineWidth = w * 0.75;
      drawCenteredName(ctx, userName, w / 2, nameY, maxLineWidth, fontSize);

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

  const buildPdfBlob = useCallback(async (name: string): Promise<Blob> => {
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
    if (!ctx) throw new Error('Canvas context tidak tersedia');
    ctx.drawImage(img, 0, 0, w, h);
    const fontSize = Math.min(44, (w / 800) * 44);
    drawCenteredName(ctx, name, w / 2, h * 0.47, w * 0.75, fontSize);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF({
      orientation: w > h ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [w * 0.264583, h * 0.264583],
    });
    pdf.addImage(dataUrl, 'JPEG', 0, 0, w * 0.264583, h * 0.264583);
    return pdf.output('blob');
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!userName) return;
    setDownloading(true);
    try {
      const blob = await buildPdfBlob(userName);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sertifikat-Penghargaan-${userName.replace(/\s+/g, '-')}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Gagal mengunduh PDF. Coba lagi.');
    } finally {
      setDownloading(false);
    }
  }, [userName, buildPdfBlob]);

  const handleTestPdf = useCallback(async () => {
    const nameToUse = userName || 'Admin Test';
    setDownloading(true);
    try {
      const blob = await buildPdfBlob(nameToUse);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      console.error(e);
      alert('Gagal membuka preview PDF. Coba lagi.');
    } finally {
      setDownloading(false);
    }
  }, [userName, buildPdfBlob]);

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white drop-shadow">Sertifikat Penghargaan</h1>
          <div className="flex flex-wrap gap-2">
            <GameButton onClick={() => router.push('/results/prepost?view=posttest')} className="from-gray-500 to-gray-600">
              ← Hasil
            </GameButton>
            <GameButton onClick={handleTestPdf} disabled={downloading} className="from-amber-500 to-amber-600" title="Buka PDF di tab baru untuk cek posisi nama">
              {downloading ? '...' : '🔍 Test PDF'}
            </GameButton>
            <GameButton onClick={handleDownloadImage} disabled={downloading} className="from-emerald-500 to-emerald-600">
              {downloading ? '...' : '📥 Download PNG'}
            </GameButton>
            <GameButton onClick={handleDownloadPdf} disabled={downloading} className="from-blue-500 to-blue-600 font-bold">
              {downloading ? '...' : '📄 Download PDF'}
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
            {/* Nama panjang tetap di tengah (wrap, center horizontal & vertikal) */}
            <div
              className="absolute left-0 right-0 flex flex-col items-center justify-center pointer-events-none px-4"
              style={{ top: '47%', transform: 'translateY(-50%)' }}
            >
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#1e3a5f] text-center max-w-[85%] break-words leading-tight">
                {userName}
              </p>
            </div>
          </div>

          {/* Tombol download jelas di bawah gambar — selalu terlihat */}
          <div className="mt-6 w-full border-t border-gray-200 pt-6">
            <p className="text-gray-700 font-semibold mb-3">Unduh sertifikat (nama: {userName})</p>
            <div className="flex flex-wrap gap-3">
              <GameButton onClick={handleTestPdf} disabled={downloading} className="from-amber-500 to-amber-600">
                {downloading ? '...' : '🔍 Test PDF (preview)'}
              </GameButton>
              <GameButton onClick={handleDownloadImage} disabled={downloading} className="from-emerald-500 to-emerald-600">
                {downloading ? '...' : '📥 Download PNG'}
              </GameButton>
              <GameButton onClick={handleDownloadPdf} disabled={downloading} className="from-blue-500 to-blue-600 font-bold px-6">
                {downloading ? '...' : '📄 Download PDF'}
              </GameButton>
            </div>
          </div>

          <p className="text-gray-500 text-xs mt-4">Gunakan tombol di atas untuk mengunduh sertifikat dengan nama Anda.</p>
        </div>
      </div>
    </div>
  );
}
