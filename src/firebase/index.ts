import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services safely.
 * Authentication has been removed as per user request.
 */
export function initializeFirebase(): {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
} {
  // Prevent server-side initialization
  if (typeof window === 'undefined') {
    return { 
      firebaseApp: {} as FirebaseApp, 
      firestore: {} as Firestore
    };
  }

  // Check if config is present
  const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== '';

  if (!isConfigValid) {
    console.warn("Firebase configuration is missing. Link a project in the sidebar to enable database features.");
    return { 
      firebaseApp: {} as FirebaseApp, 
      firestore: {} as Firestore
    };
  }

  try {
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);

    return { firebaseApp, firestore };
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
    return { 
      firebaseApp: {} as FirebaseApp, 
      firestore: {} as Firestore
    };
  }
}

export * from './provider';
export * from './client-provider';
