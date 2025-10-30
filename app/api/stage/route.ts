import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';

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

    if (!userId) {
      return NextResponse.json({ message: 'userId diperlukan' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ message: 'Database tidak tersedia' }, { status: 503 });
    }

    const querySnap = await adminDb
      .collection('stage_attempts')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const attempts = querySnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

    // Build latest pass status per stage
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
