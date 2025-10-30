import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { userId, type, answers } = await request.json();

    if (!userId || !type || !answers) {
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

    const evalRef = adminDb.collection('evaluations').doc();
    await evalRef.set({
      userId,
      type,
      answers,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Evaluasi berhasil disimpan',
      evalId: evalRef.id
    });

  } catch (error) {
    console.error('Evaluation save error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat menyimpan evaluasi' },
      { status: 500 }
    );
  }
}

