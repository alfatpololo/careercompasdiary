/**
 * Buat user admin (guru) di Firebase Auth + Firestore.
 * Jalankan: npm run create:admin
 * Default: admin@mail.com / 1234 (bisa diubah di bawah)
 */
import admin from 'firebase-admin';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, existsSync, readdirSync } from 'fs';

config({ path: resolve(process.cwd(), '.env.local') });

const ADMIN_EMAIL = 'admin@mail.com';
const ADMIN_PASSWORD = '123456'; // Firebase minimal 6 karakter

function findCredentialFile(): string | null {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const p = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (existsSync(p)) return p;
  }
  const candidates = [
    'serviceAccountKey.json',
    'quiz-gdevelop-firebase-adminsdk-fbsvc-824673e282.json',
    ...readdirSync(process.cwd(), { withFileTypes: true })
      .filter((f) => f.isFile() && f.name.includes('firebase') && f.name.endsWith('.json'))
      .map((f) => f.name),
  ];
  for (const name of candidates) {
    const p = resolve(process.cwd(), name);
    if (existsSync(p)) return p;
  }
  return null;
}

function parsePrivateKey(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== 'string') return undefined;
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, '\n');
  return key.trim();
}

if (!admin.apps.length) {
  let initialized = false;
  const credPath = findCredentialFile();
  if (credPath) {
    try {
      const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      initialized = true;
    } catch (err) {
      console.error('[CreateAdmin] Gagal load service account JSON:', err);
    }
  }
  if (!initialized) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = parsePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
    if (projectId && clientEmail && privateKey) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        });
        initialized = true;
      } catch (err) {
        console.error('[CreateAdmin] Invalid PEM:', err);
      }
    }
  }
  if (!admin.apps.length) {
    console.error('❌ Firebase Admin credentials not found. Cek .env.local atau file JSON service account.');
    process.exit(1);
  }
}

const db = admin.firestore();
const auth = admin.auth();

async function createAdmin() {
  console.log('\n👤 Creating admin user...');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Role: guru (akses CMS)\n`);

  try {
    let userRecord: admin.auth.UserRecord;

    try {
      userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log('   ℹ️  User sudah ada di Firebase Auth, akan update password dan Firestore.');
      await auth.updateUser(userRecord.uid, { password: ADMIN_PASSWORD });
    } catch {
      userRecord = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        emailVerified: true,
      });
      console.log('   ✅ User dibuat di Firebase Auth:', userRecord.uid);
    }

    const userId = userRecord.uid;
    const userRef = db.collection('users').doc(userId);
    const existing = await userRef.get();

    const userData = {
      username: 'admin',
      email: ADMIN_EMAIL,
      role: 'guru',
      progress: [],
      usia: 0,
      jenisKelamin: '-',
      alamat: '-',
      namaSekolah: '-',
      phone: '-',
      updatedAt: new Date(),
      ...(existing.exists ? {} : { createdAt: new Date() }),
    };

    await userRef.set(userData, { merge: true });
    console.log('   ✅ Firestore users/' + userId + ' diset role: guru');

    console.log('\n🎉 Admin siap.');
    console.log('   Login di app dengan: ' + ADMIN_EMAIL + ' / ' + ADMIN_PASSWORD);
    console.log('   Setelah login, menu CMS (Intro, Quiz, Evaluasi, dll) akan tersedia.\n');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

createAdmin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
