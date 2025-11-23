import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

// GET /api/cms/developers
export async function GET() {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });
    }

    // Get developers from Firestore
    const developersDoc = await adminDb.collection('cms_developers').doc('team').get();
    
    if (developersDoc.exists) {
      const data = developersDoc.data();
      return NextResponse.json({ success: true, data: data?.developers || [] });
    }

    // Return empty array if not found
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('CMS Developers GET error:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// POST /api/cms/developers
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database tidak tersedia' }, { status: 503 });
    }

    const { developers } = await request.json();

    if (!developers || !Array.isArray(developers)) {
      return NextResponse.json({ success: false, error: 'Developers array diperlukan' }, { status: 400 });
    }

    // Save to Firestore
    await adminDb.collection('cms_developers').doc('team').set({
      developers,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Tim pengembang berhasil disimpan' });
  } catch (error) {
    console.error('CMS Developers POST error:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data' }, { status: 500 });
  }
}

