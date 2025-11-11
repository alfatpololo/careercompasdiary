import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('[Register API] POST request received');
    
    const { 
      username, 
      usia, 
      jenisKelamin, 
      alamat, 
      namaSekolah, 
      email, 
      phone, 
      role,
      userId // userId dari Firebase Auth (harus ada!)
    } = await request.json();

    console.log('[Register API] Request data:', { userId, email, username });

    // userId HARUS ada karena ini dari Firebase Auth
    if (!userId) {
      console.error('[Register API] ❌ userId is required (from Firebase Auth)');
      return NextResponse.json(
        { message: 'User ID tidak ditemukan. Pastikan registrasi melalui Firebase Auth.' },
        { status: 400 }
      );
    }

    if (!username || !email || !usia || !jenisKelamin || !alamat || !namaSekolah || !phone) {
      console.error('[Register API] ❌ Missing required fields');
      return NextResponse.json(
        { message: 'Semua field diperlukan' },
        { status: 400 }
      );
    }

    // Check if Firebase Admin is available
    if (!adminDb) {
      console.error('[Register API] ❌ Firebase Admin not initialized');
      return NextResponse.json(
        { message: 'Database tidak tersedia' },
        { status: 503 }
      );
    }

    // Cek apakah user document dengan userId ini sudah ada
    const existingUserDoc = await adminDb.collection('users').doc(userId).get();
    if (existingUserDoc.exists) {
      console.log(`[Register API] User document ${userId} already exists, updating...`);
      // Update existing document
      await adminDb.collection('users').doc(userId).update({
        username,
        usia: parseInt(usia),
        jenisKelamin,
        alamat,
        namaSekolah,
        email,
        phone,
        role: role || 'siswa',
        updatedAt: new Date()
      });
      return NextResponse.json(
        { message: 'User data updated successfully', userId },
        { status: 200 }
      );
    }

    // Cek apakah username sudah ada di user lain
    const existingUsername = await adminDb.collection('users').where('username', '==', username).get();
    if (!existingUsername.empty && existingUsername.docs[0].id !== userId) {
      console.error('[Register API] ❌ Username already exists');
      return NextResponse.json(
        { message: 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Cek apakah email sudah ada di user lain
    const existingEmail = await adminDb.collection('users').where('email', '==', email).get();
    if (!existingEmail.empty && existingEmail.docs[0].id !== userId) {
      console.error('[Register API] ❌ Email already exists');
      return NextResponse.json(
        { message: 'Email sudah digunakan' },
        { status: 400 }
      );
    }

    // Simpan ke Firebase dengan userId sebagai document ID (CRITICAL!)
    console.log(`[Register API] Creating user document with ID: ${userId}`);
    await adminDb.collection('users').doc(userId).set({
      username,
      usia: parseInt(usia),
      jenisKelamin,
      alamat,
      namaSekolah,
      email,
      phone,
      role: role || 'siswa',
      progress: [], // INITIALIZE progress array - CRITICAL!
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log(`[Register API] ✅ User document created successfully with ID: ${userId}`);

    return NextResponse.json(
      { message: 'User berhasil didaftarkan', userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Register API] ❌ Registration error:', error);
    console.error('[Register API] ❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { message: `Terjadi kesalahan saat mendaftarkan user: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
