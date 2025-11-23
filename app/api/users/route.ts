import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { ApiResponse, User } from '@/types/user';

// GET /api/users?userId=... OR GET /api/users?role=guru
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
    const role = searchParams.get('role');

    // If userId is provided, return single user
    if (userId) {
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
    }

    // If role is provided, return all users with that role
    if (role && ['guru', 'siswa'].includes(role)) {
      const usersRef = adminDb.collection('users');
      const snapshot = await usersRef.where('role', '==', role).get();
      const users: Array<User & { username?: string; namaSekolah?: string; phone?: string }> = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email || '',
          role: (data.role as 'guru' | 'siswa') || 'siswa',
          progress: data.progress || [],
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date(),
          username: data.username,
          namaSekolah: data.namaSekolah,
          phone: data.phone,
        });
      });

      return NextResponse.json<ApiResponse<Array<User & { username?: string; namaSekolah?: string; phone?: string }>>>({
        success: true,
        data: users
      });
    }

    // If no userId and no role, return all users
    const usersRef = adminDb.collection('users');
    const snapshot = await usersRef.get();
    const allUsers: Array<User & { username?: string; namaSekolah?: string; phone?: string; name?: string }> = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      allUsers.push({
        id: doc.id,
        email: data.email || '',
        role: (data.role as 'guru' | 'siswa') || 'siswa',
        progress: data.progress || [],
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
        username: data.username,
        namaSekolah: data.namaSekolah,
        phone: data.phone,
        name: data.name || data.username || data.email,
      });
    });

    return NextResponse.json<ApiResponse<Array<User & { username?: string; namaSekolah?: string; phone?: string; name?: string }>>>({
      success: true,
      data: allUsers
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to get users'
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
