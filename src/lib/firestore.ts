'use client';

import { 
  collection, 
  addDoc, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { Intention, RealityLog } from './schema';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { PUBLIC_USER_ID } from './DataContext';

export function addIntention(db: Firestore, userId: string, data: Omit<Intention, 'id' | 'createdAt'>) {
  // We use the provided userId or fall back to public if needed, 
  // but for consistency we'll use the public ID now.
  const colRef = collection(db, 'users', PUBLIC_USER_ID, 'intentions');
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
  };

  addDoc(colRef, payload).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: colRef.path,
      operation: 'create',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });
}

export function addRealityLog(db: Firestore, userId: string, data: Omit<RealityLog, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'users', PUBLIC_USER_ID, 'realityLogs');
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
  };

  addDoc(colRef, payload).catch(async (error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: colRef.path,
      operation: 'create',
      requestResourceData: payload,
    } satisfies SecurityRuleContext));
  });
}
