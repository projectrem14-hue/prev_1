
'use client';

import React, { ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

/**
 * Simplified provider that bypasses real initialization checks 
 * to allow the prototype to function without API keys.
 */
export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  // Pass empty/dummy instances to satisfy hook requirements
  return (
    <FirebaseProvider 
      firebaseApp={{} as FirebaseApp} 
      firestore={{} as Firestore} 
      auth={{} as Auth}
    >
      {children}
    </FirebaseProvider>
  );
};
