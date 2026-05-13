
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services safely.
 * Returns dummy objects during SSR or if config is missing to prevent crashes.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
} {
  // Prevent server-side initialization
  if (typeof window === 'undefined') {
    return { 
      firebaseApp: {} as FirebaseApp, 
      firestore: {} as Firestore, 
      auth: {} as Auth 
    };
  }

  // Check if config is at least partially present
  const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

  if (!isConfigValid) {
    console.warn("Firebase configuration is missing or incomplete. Please link your project.");
    return { 
      firebaseApp: {} as FirebaseApp, 
      firestore: {} as Firestore, 
      auth: {} as Auth 
    };
  }

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
