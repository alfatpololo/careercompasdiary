import admin from 'firebase-admin';
import { config } from 'dotenv';
import { resolve } from 'path';
import { readFileSync, existsSync, readdirSync } from 'fs';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

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

// Initialize Firebase Admin (same logic as lib/firebaseAdmin.ts)
if (!admin.apps.length) {
  let initialized = false;

  const credPath = findCredentialFile();
  if (credPath) {
    try {
      const serviceAccount = JSON.parse(readFileSync(credPath, 'utf8'));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      initialized = true;
      console.log('✅ Firebase Admin initialized (from JSON file)');
    } catch (err) {
      console.error('[Reset] Gagal load service account JSON:', err);
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
        console.log('✅ Firebase Admin initialized (from env)');
      } catch (err) {
        console.error('[Reset] Invalid PEM:', err);
      }
    }
  }

  if (!admin.apps.length) {
    console.error('❌ Firebase Admin credentials not found!');
    console.error('   Opsi 1: Taruh file JSON (serviceAccountKey.json atau quiz-gdevelop-firebase-adminsdk-*.json) di root project');
    console.error('   Opsi 2: Set GOOGLE_APPLICATION_CREDENTIALS di .env.local');
    console.error('   Opsi 3: Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY di .env.local');
    process.exit(1);
  }
}

const db = admin.firestore();
const auth = admin.auth();

async function deleteAllAuthUsers() {
  console.log('\n🔥 Deleting all Firebase Authentication users...\n');
  
  try {
    let deletedCount = 0;
    let nextPageToken: string | undefined;

    do {
      const listUsersResult = await auth.listUsers(1000, nextPageToken);
      
      const deletePromises = listUsersResult.users.map(async (userRecord) => {
        try {
          await auth.deleteUser(userRecord.uid);
          console.log(`   ✅ Deleted Auth user: ${userRecord.email || userRecord.uid}`);
          deletedCount++;
        } catch (error) {
          console.error(`   ❌ Failed to delete user ${userRecord.uid}:`, error);
        }
      });

      await Promise.all(deletePromises);
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`\n✅ Authentication reset complete!`);
    console.log(`   - Total Auth users deleted: ${deletedCount}\n`);
    
    return deletedCount;
  } catch (error) {
    console.error('\n❌ Error deleting Auth users:', error);
    throw error;
  }
}

async function deleteCollection(collectionPath: string) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    return 0;
  }

  // Delete in batches of 500 (Firestore limit)
  const batches: admin.firestore.WriteBatch[] = [];
  let currentBatch = db.batch();
  let count = 0;
  
  snapshot.docs.forEach((doc, index) => {
    currentBatch.delete(doc.ref);
    count++;
    
    // Commit batch every 500 docs
    if ((index + 1) % 500 === 0) {
      batches.push(currentBatch);
      currentBatch = db.batch();
    }
  });
  
  // Add remaining batch
  if (count % 500 !== 0) {
    batches.push(currentBatch);
  }
  
  // Execute all batches
  for (const batch of batches) {
    await batch.commit();
  }
  
  return count;
}

async function setupDatabaseStructure() {
  console.log('\n📦 Setting up database structure...\n');

  // Collections yang diperlukan untuk proyek ini:
  // 1. users - user accounts dengan progress
  // 2. stage_attempts - attempt history per stage
  // 3. diaries - catatan harian
  // 4. evaluations - hasil evaluasi
  // 5. quiz_results - hasil quiz

  // Firestore tidak perlu pre-create collections (auto-create saat pertama write)
  // Tapi kita bisa buat dokumentasi structure dengan membuat dummy doc lalu delete

  const structure = [
    {
      name: 'users',
      description: 'User accounts dengan progress tracking',
      fields: ['id', 'email', 'role', 'progress[]', 'createdAt', 'updatedAt']
    },
    {
      name: 'stage_attempts',
      description: 'Attempt history untuk setiap stage (concern, control, curiosity, confidence)',
      fields: ['userId', 'stage', 'score', 'passed', 'answers[]', 'createdAt']
    },
    {
      name: 'diaries',
      description: 'Catatan harian user',
      fields: ['userId', 'nama', 'tanggal', 'judul', 'isi', 'createdAt']
    },
    {
      name: 'evaluations',
      description: 'Hasil evaluasi (process & result)',
      fields: ['userId', 'type', 'answers[]', 'createdAt']
    },
    {
      name: 'quiz_results',
      description: 'Hasil quiz per stage',
      fields: ['userId', 'stage', 'score', 'answers[]', 'createdAt']
    }
  ];

  console.log('📋 Project Collections Structure:\n');
  structure.forEach((col, index) => {
    console.log(`   ${index + 1}. ${col.name}`);
    console.log(`      → ${col.description}`);
    console.log(`      → Fields: ${col.fields.join(', ')}\n`);
  });

  console.log('✅ Database structure documented');
  console.log('   (Collections akan dibuat otomatis saat pertama kali digunakan)\n');
}

async function resetDatabase() {
  console.log('\n🔥 Starting FULL Firebase Reset (Auth + Firestore)...\n');

  try {
    // Step 1: Delete all Firebase Authentication users
    const authDeletedCount = await deleteAllAuthUsers();

    // Step 2: Clear all Firestore collections
    console.log('📋 Clearing Firestore collections...\n');
    const collections = await db.listCollections();
    console.log(`📋 Found ${collections.length} collections\n`);

    let totalDeleted = 0;
    const deletedCollections: { name: string; count: number }[] = [];

    // Delete ALL collections
    for (const collection of collections) {
      console.log(`🗑️  Deleting collection: ${collection.id}...`);
      const count = await deleteCollection(collection.id);
      totalDeleted += count;
      
      if (count > 0) {
        deletedCollections.push({ name: collection.id, count });
        console.log(`   ✅ Deleted ${count} documents from ${collection.id}`);
      } else {
        console.log(`   ℹ️  Collection ${collection.id} was already empty`);
      }
    }

    console.log('\n✅ Firebase FULL Reset Complete!');
    console.log('\n📊 Reset Summary:');
    console.log(`   - Auth users deleted: ${authDeletedCount}`);
    console.log(`   - Collections processed: ${collections.length}`);
    console.log(`   - Total Firestore documents deleted: ${totalDeleted}`);
    
    if (deletedCollections.length > 0) {
      console.log('\n   Deleted collections:');
      deletedCollections.forEach(({ name, count }) => {
        console.log(`   - ${name}: ${count} documents`);
      });
    }
    
    // Step 3: Setup database structure
    await setupDatabaseStructure();

    console.log('\n🎉 Firebase FULL Reset complete and ready for use!');
    console.log('   ✅ All Authentication users deleted');
    console.log('   ✅ All Firestore collections cleared');
    console.log('   ✅ Database structure documented\n');

  } catch (error) {
    console.error('\n❌ Error during reset:', error);
    process.exit(1);
  }
}

// Run reset
resetDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

