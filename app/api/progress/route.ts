import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
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

    // Verify user exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
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
    if (!adminDb) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Firebase Admin not initialized'
      }, { status: 500 });
    }

    const body: ProgressRequest = await request.json();
    const { userId, levelId, score, completed } = body;

    // Validate input
    if (!userId || levelId === undefined || score === undefined || completed === undefined) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'userId, levelId, score, and completed are required'
      }, { status: 400 });
    }

    // Verify user exists
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const userData = userDoc.data() as User;
    const progress = userData.progress || [];

    // Find existing progress for this level
    const existingIndex = progress.findIndex(p => p.levelId === levelId);
    
    const newProgress: Progress = {
      levelId,
      score,
      completed,
      completedAt: completed ? new Date() : undefined
    };

    if (existingIndex >= 0) {
      // Update existing progress
      progress[existingIndex] = newProgress;
    } else {
      // Add new progress
      progress.push(newProgress);
    }

    // Update user document
    await adminDb.collection('users').doc(userId).update({
      progress,
      updatedAt: new Date()
    });

    return NextResponse.json<ApiResponse<{ progress: Progress[] }>>({
      success: true,
      data: { progress },
      message: 'Progress updated successfully'
    });

  } catch (error) {
    console.error('Update progress error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to update progress'
    }, { status: 500 });
  }
}
