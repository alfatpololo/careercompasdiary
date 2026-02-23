import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

const LEADERBOARD_LIMIT = 10;

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { message: 'Database tidak tersedia' },
        { status: 503 }
      );
    }

    // Ambil semua hasil posttest
    const quizSnapshot = await adminDb
      .collection('quiz_results')
      .where('isPosttest', '==', true)
      .get();

    // Kelompokkan per userId, ambil skor tertinggi per user
    const userBestScores: Record<string, { total: number; percent: number; createdAt: string }> = {};
    for (const doc of quizSnapshot.docs) {
      const data = doc.data();
      const userId = data.userId as string;
      const total = (data.total as number) ?? 0;
      const percent = (data.percent as number) ?? 0;
      const createdAt = (data.createdAt as string) ?? '';

      if (!userId) continue;

      const existing = userBestScores[userId];
      if (!existing || total > existing.total) {
        userBestScores[userId] = { total, percent, createdAt };
      }
    }

    // Urutkan berdasarkan total skor (descending), limit 10
    const sorted = Object.entries(userBestScores)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, LEADERBOARD_LIMIT);

    // Ambil data user (username) untuk userId yang masuk top 10
    const leaderboard: Array<{
      rank: number;
      userId: string;
      username: string;
      total: number;
      percent: number;
    }> = [];

    for (let i = 0; i < sorted.length; i++) {
      const [userId, { total, percent }] = sorted[i];
      let username = 'Siswa';

      try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          username = (userData?.username as string) || (userData?.email as string) || 'Siswa';
        }
      } catch {
        // fallback ke Siswa
      }

      leaderboard.push({
        rank: i + 1,
        userId,
        username,
        total,
        percent,
      });
    }

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data leaderboard' },
      { status: 500 }
    );
  }
}
