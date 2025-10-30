import { getApps, initializeApp as initClientApp } from "firebase/app";
import { getAuth as getClientAuth } from "firebase/auth";

// ===============================
// 🌐 FIREBASE CLIENT SDK (FRONTEND SIDE ONLY)
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
