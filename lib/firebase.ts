import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * These are inlined at build time, so a build without them produces an app that
 * cannot talk to Firebase at all. Failing loudly here is deliberate — the
 * alternative is a successful build that is silently broken in production, and
 * Firebase's own error for this is just `auth/invalid-api-key` with no clue as
 * to which variable is missing or where to set it.
 */
const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`);

if (missing.length > 0) {
  throw new Error(
    `Firebase config is incomplete. Missing: ${missing.join(", ")}.\n` +
      `Copy .env.example to .env.local for local development, or set these as ` +
      `repository secrets for CI (see .github/workflows/ci.yml).`,
  );
}

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Offline persistence is deliberate, not incidental.
 *
 * The previous app used a bare `firebase.firestore()`. Firestore's latency
 * compensation resolves a write locally and immediately, so on a flaky connection
 * the user saw a success toast and the record on screen — but the pending write
 * lived only in that tab's memory. Closing the tab discarded it silently. With a
 * persistent cache the mutation survives reloads and is replayed on reconnect.
 *
 * `initializeFirestore` must run before any `getFirestore` call, and only once;
 * it throws if the instance already exists, hence the fallback.
 */
function createFirestore() {
  if (typeof window === "undefined") return getFirestore(app);
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    return getFirestore(app);
  }
}

export const db = createFirestore();
export const auth = getAuth(app);
export const storage = getStorage(app);
