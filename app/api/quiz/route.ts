import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { userId, answers, scores, total, percent, category, isPosttest } = await request.json();

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
      isPosttest: isPosttest || false, // Tandai apakah ini posttest
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

// Get quiz results by userId or all quizzes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!adminDb) {
      return NextResponse.json(
        { message: 'Database tidak tersedia' },
        { status: 503 }
      );
    }

    // If userId provided, get quizzes for that user
    // Otherwise, get all quizzes
    let quizQuery;
    if (userId) {
      quizQuery = await adminDb.collection('quiz_results')
        .where('userId', '==', userId)
        .get();
    } else {
      quizQuery = await adminDb.collection('quiz_results').get();
    }

    const results = quizQuery.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt || null,
        };
      })
      .sort((a, b) => {
        // Sort by createdAt descending (latest first)
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Quiz get error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Quiz get error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { message: `Terjadi kesalahan saat mengambil data: ${errorMessage}` },
      { status: 500 }
    );
  }
}

