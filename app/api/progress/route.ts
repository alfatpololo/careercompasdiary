import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { ProgressRequest, ApiResponse, Progress, User } from '@/types/user';

// GET /api/progress?userId=...
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Firebase Admin not initialized'
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'userId parameter is required'
      }, { status: 400 });
    }

    // Get user document (create if not exists)
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      // User not found in Firestore, return empty progress
      console.log(`[Progress API] User ${userId} not found in Firestore, returning empty progress`);
      return NextResponse.json<ApiResponse<{ progress: Progress[] }>>({
        success: true,
        data: { progress: [] }
      });
    }

    const userData = userDoc.data() as User;
    
    return NextResponse.json<ApiResponse<{ progress: Progress[] }>>({
      success: true,
      data: { progress: userData.progress || [] }
    });

  } catch (error) {
    console.error('Get progress error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to get progress'
    }, { status: 500 });
  }
}

// POST /api/progress
export async function POST(request: NextRequest) {
  try {
    console.log('[Progress API] POST request received');
    
    if (!adminDb) {
      console.error('[Progress API] ❌ Firebase Admin not initialized');
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Firebase Admin not initialized'
      }, { status: 500 });
    }

    const body: ProgressRequest = await request.json();
    console.log('[Progress API] Request body:', JSON.stringify(body, null, 2));
    const { userId, levelId, score, completed } = body;

    // Validate input
    if (!userId || levelId === undefined || score === undefined || completed === undefined) {
      console.error('[Progress API] ❌ Missing required fields:', { userId, levelId, score, completed });
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'userId, levelId, score, and completed are required'
      }, { status: 400 });
    }

    // Get user document (must exist - user should be created during registration)
    console.log(`[Progress API] Fetching user document: ${userId}`);
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      // User not found - return error (user should exist from registration)
      console.error(`[Progress API] ❌ User ${userId} not found in Firestore`);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found. Please register first.'
      }, { status: 404 });
    }

    const userData = userDoc.data() as User;
    console.log('[Progress API] User data found:', {
      email: userData.email,
      hasProgress: !!userData.progress,
      progressLength: userData.progress?.length || 0
    });
    
    const progress = userData.progress || [];
    console.log('[Progress API] Current progress:', progress);

    // Find existing progress for this level
    const existingIndex = progress.findIndex(p => p.levelId === levelId);
    console.log(`[Progress API] Existing progress index for ${levelId}:`, existingIndex);
    
    const newProgress: Progress = {
      levelId,
      score,
      completed,
      completedAt: completed ? new Date() : undefined
    };

    if (existingIndex >= 0) {
      // Update existing progress
      console.log(`[Progress API] Updating existing progress at index ${existingIndex}`);
      progress[existingIndex] = newProgress;
    } else {
      // Add new progress
      console.log(`[Progress API] Adding new progress for ${levelId}`);
      progress.push(newProgress);
    }

    console.log('[Progress API] Updated progress array:', progress);

    // Update user document
    console.log(`[Progress API] Updating user document ${userId} with progress`);
    await adminDb.collection('users').doc(userId).update({
      progress,
      updatedAt: new Date()
    });

    console.log('[Progress API] ✅ Progress updated successfully');

    // Verify the update
    const verifyDoc = await adminDb.collection('users').doc(userId).get();
    const verifyData = verifyDoc.data() as User;
    console.log('[Progress API] ✅ Verification - updated progress:', verifyData.progress);

    return NextResponse.json<ApiResponse<{ progress: Progress[] }>>({
      success: true,
      data: { progress },
      message: 'Progress updated successfully'
    });

  } catch (error) {
    console.error('[Progress API] ❌ Update progress error:', error);
    console.error('[Progress API] ❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json<ApiResponse>({
      success: false,
      error: `Failed to update progress: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}
