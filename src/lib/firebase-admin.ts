import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let db: FirebaseFirestore.Firestore | null = null;
let auth: import('firebase-admin/auth').Auth | null = null;

if (!getApps().length) {
    try {
        initializeApp();
    } catch(e) {
        console.error("Could not initialize Firebase Admin SDK. This is expected during local development without credentials. Server-side features depending on Firebase Admin will be disabled.");
    }
}

// Only try to get Firestore/Auth if the app was successfully initialized
if (getApps().length > 0) {
    try {
        db = getFirestore();
        auth = getAuth();
    } catch (e) {
        console.error("Failed to get Firestore or Auth instance from Firebase Admin.", e);
    }
}

export { db, auth };
