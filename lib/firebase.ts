import { getApps, initializeApp as initClientApp, type FirebaseApp } from "firebase/app";
import { getAuth as getClientAuth, type Auth } from "firebase/auth";

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

function hasClientConfig(): boolean {
  const { apiKey, authDomain, projectId, appId } = clientCredentials as Record<string, string | undefined>;
  return !!(apiKey && authDomain && projectId && appId);
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

export function getClientAuthInstance(): Auth | null {
  if (typeof window === 'undefined') return null; // SSR/prerender: jangan init
  if (!hasClientConfig()) {
    console.warn('Firebase client env is missing. Skipping client initialization.');
    return null;
  }
  if (!cachedApp) {
    cachedApp = getApps().length === 0 ? initClientApp(clientCredentials) : getApps()[0];
  }
  if (!cachedAuth) {
    cachedAuth = getClientAuth(cachedApp);
  }
  return cachedAuth;
}
