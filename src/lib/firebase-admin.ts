import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let db: FirebaseFirestore.Firestore | null = null;
let auth: import('firebase-admin/auth').Auth | null = null;

try {
  if (!getApps().length) {
    initializeApp();
  }
  db = getFirestore();
  auth = getAuth();
} catch (error) {
    console.error("Could not initialize Firebase Admin SDK. This is expected during local development without credentials. Server-side features depending on Firebase Admin will be disabled.", (error as Error).message);
}


export { db, auth };
