import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { ApiResponse, User } from '@/types/user';

// GET /api/users?userId=...
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

    // Get user data
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    const userData = userDoc.data() as User;
    
    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: {
        ...userData,
        id: userId
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to get user data'
    }, { status: 500 });
  }
}

// GET /api/users (get all users - for admin purposes)
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Firebase Admin not initialized'
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // Optional filter by role

    const usersRef = adminDb.collection('users');
    let snapshot;
    
    if (role && ['guru', 'siswa'].includes(role)) {
      snapshot = await usersRef.where('role', '==', role).get();
    } else {
      snapshot = await usersRef.get();
    }
    const users: User[] = [];

    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data() as Omit<User, 'id'>
      });
    });

    return NextResponse.json<ApiResponse<User[]>>({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to get users'
    }, { status: 500 });
  }
}
