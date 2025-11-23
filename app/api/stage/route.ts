import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { userId, stage, answers, score, passed } = await request.json();

    if (!userId || !stage || !Array.isArray(answers) || typeof score !== 'number' || typeof passed !== 'boolean') {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ message: 'Database tidak tersedia' }, { status: 503 });
    }

    const attemptRef = adminDb.collection('stage_attempts').doc();
    await attemptRef.set({
      userId,
      stage,
      answers,
      score,
      passed,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Stage attempt saved', attemptId: attemptRef.id });
  } catch (error) {
    console.error('Stage attempt save error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan saat menyimpan attempt' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!adminDb) {
      return NextResponse.json({ message: 'Database tidak tersedia' }, { status: 503 });
    }

    // If userId provided, get attempts for that user
    // Otherwise, get all attempts
    let querySnap;
    if (userId) {
      querySnap = await adminDb
        .collection('stage_attempts')
        .where('userId', '==', userId)
        .get();
    } else {
      querySnap = await adminDb.collection('stage_attempts').get();
    }

    type AttemptData = { userId?: string; stage: string; score: number; passed: boolean; createdAt: string; answers?: unknown[] };
    const attempts = querySnap.docs.map(d => ({ id: d.id, ...(d.data() as AttemptData) }))
      .sort((a, b) => {
        // Sort by createdAt descending (latest first)
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

    // Build latest pass status per stage (already sorted, so first occurrence is latest)
    const latest: Record<string, { score: number; passed: boolean; createdAt: string }> = {};
    for (const a of attempts) {
      if (!latest[a.stage]) {
        latest[a.stage] = { score: a.score, passed: a.passed, createdAt: a.createdAt };
      }
    }

    return NextResponse.json({ attempts, latest });
  } catch (error) {
    console.error('Stage attempts fetch error:', error);
    return NextResponse.json({ message: 'Gagal mengambil data' }, { status: 500 });
  }
}
