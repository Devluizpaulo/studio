import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App | undefined;
let db: Firestore | null = null;
let auth: Auth | null = null;

// This check is crucial for server-side environments where credentials might not be present
// during build time or in certain development setups.
const hasCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_CONFIG;

if (hasCredentials) {
  if (getApps().length === 0) {
    try {
      app = initializeApp();
    } catch (e) {
      console.error("Firebase Admin SDK initialization failed:", e);
    }
  } else {
    app = getApps()[0];
  }

  if (app) {
    try {
      db = getFirestore(app);
      auth = getAuth(app);
    } catch (e) {
      console.error("Failed to get Firestore or Auth instance from Firebase Admin.", e);
    }
  }
} else {
  console.warn(
    "Firebase Admin SDK not initialized because GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_CONFIG is not set. This is expected in some environments (like client-side browser) but will prevent server-side Firebase operations."
  );
}


export { db, auth };
