import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// GET /api/cms/intro?stage=concern
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

    // Get intro slides from Firestore
    const introDoc = await adminDb.collection('cms_intro').doc(stage).get();
    
    if (introDoc.exists) {
      const data = introDoc.data();
      return NextResponse.json({ success: true, data: data?.slides || [] });
    }

    // Return empty if not found
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('CMS Intro GET error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// POST /api/cms/intro
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });
    }

    const { stage, slides } = await request.json();

    if (!stage || !slides) {
      return NextResponse.json({ success: false, error: 'Stage dan slides diperlukan' }, { status: 400 });
    }

    // Save to Firestore
    await adminDb.collection('cms_intro').doc(stage).set({
      stage,
      slides,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Intro slides berhasil disimpan' });
  } catch (error) {
    console.error('CMS Intro POST error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data' }, { status: 500 });
  }
}


