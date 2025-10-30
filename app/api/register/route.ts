import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { 
      username, 
      password, 
      usia, 
      jenisKelamin, 
      alamat, 
      namaSekolah, 
      email, 
      phone, 
      role 
    } = await request.json();

    if (!username || !password || !email || !usia || !jenisKelamin || !alamat || !namaSekolah || !phone) {
      return NextResponse.json(
        { message: 'Semua field diperlukan' },
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

    // Cek apakah username sudah ada
    const existingUser = await adminDb.collection('users').where('username', '==', username).get();
    if (!existingUser.empty) {
      return NextResponse.json(
        { message: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah ada
    const existingEmail = await adminDb.collection('users').where('email', '==', email).get();
    if (!existingEmail.empty) {
      return NextResponse.json(
        { message: 'Email sudah digunakan' },
        { status: 400 }
      );
    }

    // Simpan ke Firebase
    const userRef = adminDb.collection('users').doc();
    await userRef.set({
      username,
      password, // Dalam produksi, gunakan hash password
      usia: parseInt(usia),
      jenisKelamin,
      alamat,
      namaSekolah,
      email,
      phone,
      role: role || 'siswa',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: 'User berhasil didaftarkan', userId: userRef.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mendaftarkan user' },
      { status: 500 }
    );
  }
}