import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { userId, nama, tanggal, judul, isi, stage } = await request.json();

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
      stage: stage || 'general',
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

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { message: 'Database tidak tersedia' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const stage = searchParams.get('stage');

    if (!userId) {
      return NextResponse.json(
        { message: 'userId diperlukan' },
        { status: 400 }
      );
    }

    let query = adminDb.collection('diaries')
      .where('userId', '==', userId);

    if (stage) {
      query = query.where('stage', '==', stage);
    }

    const snapshot = await query.get();

    const diaries = snapshot.docs
      .map(doc => {
        const data = doc.data() as {
          createdAt?: string;
          tanggal?: string;
          [key: string]: unknown;
        };
        return { id: doc.id, ...data };
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt ?? a.tanggal ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? b.tanggal ?? 0).getTime();
        return dateB - dateA;
      });

    return NextResponse.json({ diaries });
  } catch (error) {
    console.error('Diary fetch error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil catatan' },
      { status: 500 }
    );
  }
}

