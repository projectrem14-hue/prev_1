
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

export function addIntention(db: Firestore, userId: string, data: Omit<Intention, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'users', userId, 'intentions');
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
  const colRef = collection(db, 'users', userId, 'realityLogs');
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
