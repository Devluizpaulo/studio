import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App | undefined;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (getApps().length === 0) {
  try {
    // This initializes the app with default credentials from the environment.
    // It's the recommended way for App Hosting and other Google Cloud environments.
    app = initializeApp();
  } catch (e) {
    console.error("Firebase Admin SDK initialization failed:", e);
    // Keep app undefined if initialization fails
  }
} else {
  app = getApps()[0];
}

// Only try to get Firestore/Auth if the app was successfully initialized
if (app) {
  try {
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (e) {
    console.error("Failed to get Firestore or Auth instance from Firebase Admin.", e);
  }
}

export { db, auth };
