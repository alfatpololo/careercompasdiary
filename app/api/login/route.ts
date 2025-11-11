import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username dan password diperlukan' },
        { status: 400 }
      );
    }

    // Check if Firebase Admin is available
    if (!adminDb) {
      return NextResponse.json(
        { message: 'Database tidak tersedia' },
        { status: 503 }
      );
    }

    // Cari user berdasarkan username
    const userQuery = await adminDb.collection('users').where('username', '==', username).get();
    
    if (userQuery.empty) {
      return NextResponse.json(
        { message: 'Username tidak ditemukan' },
        { status: 404 }
      );
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();

    // Verifikasi password (dalam produksi, gunakan hash comparison)
    if (userData.password !== password) {
      return NextResponse.json(
        { message: 'Password salah' },
        { status: 401 }
      );
    }

    // Return user data (tanpa password)
    const userWithoutPassword = { ...userData };
    delete userWithoutPassword.password;
    
    return NextResponse.json({
      message: 'Login berhasil',
      user: {
        id: userDoc.id,
        ...userWithoutPassword
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat login' },
      { status: 500 }
    );
  }
}