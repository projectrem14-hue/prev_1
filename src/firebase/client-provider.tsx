
'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

/**
 * Ensures Firebase is initialized only on the client side.
 * This prevents SSR errors like 'invalid-api-key' which occur when
 * environment variables are not available on the server.
 */
export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const [instances, setInstances] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    try {
      const initialized = initializeFirebase();
      setInstances(initialized);
    } catch (error) {
      console.error("Critical: Failed to initialize Firebase client:", error);
    }
  }, []);

  // Show a clean loading state until Firebase is ready on the client
  if (!instances || !instances.firebaseApp.name && typeof window !== 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-headline animate-pulse">Initializing Behavioral Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseProvider 
      firebaseApp={instances.firebaseApp} 
      firestore={instances.firestore} 
      auth={instances.auth}
    >
      {children}
    </FirebaseProvider>
  );
};
