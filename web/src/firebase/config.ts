import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  Auth,
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const isNew = getApps().length === 0;
const app: FirebaseApp = isNew ? initializeApp(firebaseConfig) : getApps()[0];

// getAuth() eagerly accesses indexedDB at module level, which throws during
// Next.js SSR. initializeAuth lets us specify safe persistence per environment.
let auth: Auth;
if (isNew) {
  auth = initializeAuth(app, {
    persistence:
      typeof window !== "undefined"
        ? [indexedDBLocalPersistence, browserLocalPersistence]
        : [inMemoryPersistence],
  });
} else {
  auth = getAuth(app);
}

const firestore: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, firestore, storage };
