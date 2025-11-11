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
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { message: 'userId diperlukan' },
        { status: 400 }
      );
    }

    let query = adminDb.collection('evaluations').where('userId', '==', userId);

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.get();

    const evaluations = snapshot.docs
      .map(doc => {
        const data = doc.data() as { createdAt?: string; [key: string]: unknown };
        return { id: doc.id, ...data };
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? 0).getTime();
        return dateB - dateA;
      });

    return NextResponse.json({ evaluations });
  } catch (error) {
    console.error('Evaluation fetch error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil evaluasi' },
      { status: 500 }
    );
  }
}

