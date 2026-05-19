'use client';

import React, { ReactNode, useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

/**
 * Ensures Firebase is initialized only once on the client and shared via context.
 */
export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const services = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider 
      firebaseApp={services.firebaseApp} 
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
};
