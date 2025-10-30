import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { userId, answers, scores, total, percent, category } = await request.json();

    if (!userId || !answers || !scores) {
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

    // Save quiz results to Firebase
    const quizRef = adminDb.collection('quiz_results').doc();
    await quizRef.set({
      userId,
      answers: {
        concern: answers.concern || [],
        control: answers.control || [],
        curiosity: answers.curiosity || [],
        confidence: answers.confidence || []
      },
      scores: {
        concern: scores.concern || 0,
        control: scores.control || 0,
        curiosity: scores.curiosity || 0,
        confidence: scores.confidence || 0
      },
      total,
      percent,
      category,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Hasil kuesioner berhasil disimpan',
      quizId: quizRef.id
    });

  } catch (error) {
    console.error('Quiz save error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat menyimpan hasil' },
      { status: 500 }
    );
  }
}

// Get quiz results by userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: 'userId diperlukan' },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { message: 'Database tidak tersedia' },
        { status: 503 }
      );
    }

    // Get quiz results from Firebase
    const quizQuery = await adminDb.collection('quiz_results')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const results = quizQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Quiz get error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil data' },
      { status: 500 }
    );
  }
}

