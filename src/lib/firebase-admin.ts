import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// This simplified initialization is more robust for environments like
// Firebase App Hosting, which automatically provides credentials.
// It removes the dependency on a manually set environment variable.
if (!getApps().length) {
  try {
    initializeApp();
  } catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
    // In a production environment, you might want to handle this more gracefully.
  }
}

const db = getFirestore();
const auth = getAuth();

export { db, auth };
