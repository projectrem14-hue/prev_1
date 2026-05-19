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

/**
 * Adds a new intention to the user's stack.
 * Optimized for performance by not awaiting the write.
 */
export function addIntention(db: Firestore, userId: string, data: Omit<Intention, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'users', userId, 'intentions');
  
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
  };

  addDoc(colRef, payload).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: colRef.path,
      operation: 'create',
      requestResourceData: payload,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Records the outcome of a focus session.
 */
export function addRealityLog(db: Firestore, userId: string, data: Omit<RealityLog, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'users', userId, 'realityLogs');
  
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
  };

  addDoc(colRef, payload).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: colRef.path,
      operation: 'create',
      requestResourceData: payload,
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
  });
}
