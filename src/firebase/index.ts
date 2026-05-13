
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services safely.
 * Returns dummy objects during SSR to prevent crashes.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  if (typeof window === 'undefined') {
    return { 
      firebaseApp: {} as FirebaseApp, 
      firestore: {} as Firestore, 
      auth: {} as Auth 
    };
  }

  // We attempt to initialize even with partial config to allow Firestore to try and connect
  // If the user hasn't provided keys, the SDK will error only when a call is made.
  try {
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, firestore, auth };
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
    return { 
      firebaseApp: {} as FirebaseApp, 
      firestore: {} as Firestore, 
      auth: {} as Auth 
    };
  }
}

export * from './provider';
export * from './client-provider';
