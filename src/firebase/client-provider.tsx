
'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

/**
 * Ensures Firebase is initialized only on the client side.
 * Provides a fallback UI if configuration is missing.
 */
export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const [instances, setInstances] = useState<ReturnType<typeof initializeFirebase> | null>(null);

  useEffect(() => {
    const initialized = initializeFirebase();
    setInstances(initialized);
  }, []);

  if (!instances) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-headline animate-pulse">Initializing Behavioral Engine...</p>
        </div>
      </div>
    );
  }

  // Check if Firebase actually initialized (sdk provides a name property)
  const isInitialized = !!instances.firebaseApp.name;

  return (
    <FirebaseProvider 
      firebaseApp={instances.firebaseApp} 
      firestore={instances.firestore} 
      auth={instances.auth}
    >
      {isInitialized ? children : (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full glass-card p-8 text-center space-y-6">
            <h2 className="text-2xl font-headline font-bold text-primary">Firebase Not Connected</h2>
            <p className="text-muted-foreground">
              To use Authentication and Firestore, you must link your project in the <strong>Firebase Studio</strong> sidebar.
            </p>
            <div className="p-4 bg-muted/30 rounded-xl text-sm text-left">
              <p className="font-bold mb-2">Checklist:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Link a Firebase Project</li>
                <li>Verify NEXT_PUBLIC_ env variables</li>
                <li>Enable Email/Password Auth in Console</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </FirebaseProvider>
  );
};
