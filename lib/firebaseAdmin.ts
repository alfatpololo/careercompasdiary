import admin from "firebase-admin";
import { readFileSync, existsSync, readdirSync } from "fs";
import { resolve } from "path";

function findCredentialFile(): string | null {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const p = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (existsSync(p)) return p;
  }
  const candidates = [
    "serviceAccountKey.json",
    "quiz-gdevelop-firebase-adminsdk-fbsvc-824673e282.json",
    ...readdirSync(process.cwd(), { withFileTypes: true })
      .filter((f) => f.isFile() && f.name.includes("firebase") && f.name.endsWith(".json"))
      .map((f) => f.name),
  ];
  for (const name of candidates) {
    const p = resolve(process.cwd(), name);
    if (existsSync(p)) return p;
  }
  return null;
}

function parsePrivateKey(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, "\n");
  return key.trim();
}

if (!admin.apps.length) {
  let initialized = false;

  // Opsi 1: File JSON di root project (serviceAccountKey.json, quiz-gdevelop-firebase-adminsdk-*.json, dll)
  const credPath = findCredentialFile();
  if (credPath) {
    try {
      const serviceAccount = JSON.parse(readFileSync(credPath, "utf8"));
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      initialized = true;
    } catch (err) {
      console.error("[Firebase Admin] Gagal load service account JSON:", err);
    }
  }

  // Opsi 2: Variabel env (projectId, clientEmail, privateKey)
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
        console.error(
          "[Firebase Admin] Invalid PEM. Buat file serviceAccountKey.json di root project (dari Firebase Console > Service accounts > Generate new private key), atau perbaiki FIREBASE_ADMIN_PRIVATE_KEY di .env.local."
        );
      }
    }
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminFirestore = admin.apps.length ? admin.firestore() : null;


