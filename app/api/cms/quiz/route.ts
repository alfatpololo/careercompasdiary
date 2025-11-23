import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// GET /api/cms/quiz?stage=concern
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');

    if (!stage) {
      return NextResponse.json({ success: false, error: 'Stage parameter diperlukan' }, { status: 400 });
    }

    // Get quiz questions from Firestore
    const quizDoc = await adminDb.collection('cms_quiz').doc(stage).get();
    
    if (quizDoc.exists) {
      const data = quizDoc.data();
      return NextResponse.json({ success: true, data: data?.questions || [] });
    }

    // Return empty if not found
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('CMS Quiz GET error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// POST /api/cms/quiz
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });
    }

    const { stage, questions } = await request.json();

    if (!stage || !questions) {
      return NextResponse.json({ success: false, error: 'Stage dan questions diperlukan' }, { status: 400 });
    }

    // Save to Firestore
    await adminDb.collection('cms_quiz').doc(stage).set({
      stage,
      questions,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Quiz questions berhasil disimpan' });
  } catch (error) {
    console.error('CMS Quiz POST error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data' }, { status: 500 });
  }
}


