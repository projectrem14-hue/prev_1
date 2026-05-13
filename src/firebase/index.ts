
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services safely.
 * Returns dummy objects during SSR to prevent crashes, as these instances
 * should only be used within Client Components after hydration.
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

  // Ensure we don't attempt to initialize with an empty config which causes SDK errors
  if (!firebaseConfig.apiKey) {
    console.error("Firebase Configuration Error: API Key is missing. Check your .env file.");
    // We still return to avoid immediate crashes, but the Auth/Firestore calls will fail gracefully
  }

  const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}

export * from './provider';
export * from './client-provider';
