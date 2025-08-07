import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let db: FirebaseFirestore.Firestore;
let auth: import('firebase-admin/auth').Auth;

try {
  if (!getApps().length) {
    initializeApp();
  }
  db = getFirestore();
  auth = getAuth();
} catch (error) {
    console.error("Firebase Admin SDK initialization failed:", error);
    // Set db and auth to null or a mock implementation if initialization fails
    // This prevents the application from crashing during build or server-side rendering
    // if credentials are not available.
    // @ts-ignore
    db = null;
    // @ts-ignore
    auth = null;
}


export { db, auth };
