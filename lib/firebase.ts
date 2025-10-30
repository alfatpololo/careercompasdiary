import admin from "firebase-admin";
import { getApps, initializeApp as initClientApp } from "firebase/app";
import { getAuth as getClientAuth } from "firebase/auth";

// ===============================
// 🔐 FIREBASE ADMIN SDK (SERVER SIDE)
// ===============================
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️ Firebase Admin SDK not fully configured in environment variables");
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("✅ Firebase Admin initialized");
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminFirestore = admin.apps.length ? admin.firestore() : null;

// ===============================
// 🌐 FIREBASE CLIENT SDK (FRONTEND SIDE)
// ===============================
const clientCredentials = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseClientApp = getApps().length === 0 ? initClientApp(clientCredentials) : getApps()[0];
export const clientAuth = getClientAuth(firebaseClientApp);
