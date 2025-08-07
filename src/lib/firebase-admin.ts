import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App | undefined;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccountString) {
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

    if (getApps().length === 0) {
        app = initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        app = getApps()[0];
    }
  } else {
      console.warn("GOOGLE_APPLICATION_CREDENTIALS is not set. Firebase Admin SDK will not be initialized on the server.");
  }

} catch (e: any) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.warn("Firebase Admin SDK credentials not found. This is expected in some environments (like client-side browser) and will prevent server-side Firebase operations.");
  } else {
    console.error("Firebase Admin SDK initialization failed:", e);
  }
}

if (app) {
    db = getFirestore(app);
    auth = getAuth(app);
}

export { db, auth };
