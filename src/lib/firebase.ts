// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "rgmj-6a4f2",
  appId: "1:692857213157:web:6ce4d4948c7844a62c840c",
  storageBucket: "rgmj-6a4f2.appspot.com",
  apiKey: "AIzaSyAjrZOdzmtyIh_AOBBzf4uL5pW0m57-N2Y",
  authDomain: "rgmj-6a4f2.firebaseapp.com",
  messagingSenderId: "692857213157"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
