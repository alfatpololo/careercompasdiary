import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userId, nama, tanggal, judul, isi } = await request.json();

    if (!userId || !nama || !tanggal || !judul || !isi) {
      return NextResponse.json(
        { message: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { message: 'Database tidak tersedia' },
        { status: 503 }
      );
    }

    const diaryRef = adminDb.collection('diaries').doc();
    await diaryRef.set({
      userId,
      nama,
      tanggal,
      judul,
      isi,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Catatan harian berhasil disimpan',
      diaryId: diaryRef.id
    });

  } catch (error) {
    console.error('Diary save error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat menyimpan catatan' },
      { status: 500 }
    );
  }
}

