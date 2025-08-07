import * as admin from 'firebase-admin';

// This simplified initialization is more robust for environments like
// Firebase App Hosting, which automatically provides credentials.
// It removes the dependency on a manually set environment variable.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
    // In a production environment, you might want to handle this more gracefully.
  }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
