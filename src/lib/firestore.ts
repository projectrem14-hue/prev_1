
'use client';

import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Firestore,
  Timestamp
} from 'firebase/firestore';
import { Intention, RealityLog } from './schema';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function addIntention(db: Firestore, userId: string, data: Omit<Intention, 'id' | 'createdAt'>) {
  if (!db.type) return; // Skip if db is dummy
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
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

export function addRealityLog(db: Firestore, userId: string, data: Omit<RealityLog, 'id' | 'createdAt'>) {
  if (!db.type) return;
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
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

export async function getIntentionsByDate(db: Firestore, userId: string, date: string): Promise<Intention[]> {
  if (!db.type) return [];
  const colRef = collection(db, 'users', userId, 'intentions');
  const q = query(colRef, where('date', '==', date), orderBy('scheduledTime', 'asc'));
  
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Intention));
  } catch (error) {
    return [];
  }
}

export async function getRealityLogsByDate(db: Firestore, userId: string, date: string): Promise<RealityLog[]> {
  if (!db.type) return [];
  const colRef = collection(db, 'users', userId, 'realityLogs');
  const q = query(colRef, where('date', '==', date));
  
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RealityLog));
  } catch (error) {
    return [];
  }
}

export async function getAllIntentions(db: Firestore, userId: string): Promise<Intention[]> {
  if (!db.type) return [];
  const colRef = collection(db, 'users', userId, 'intentions');
  const q = query(colRef, orderBy('date', 'desc'), orderBy('scheduledTime', 'asc'));
  
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Intention));
  } catch (error) {
    return [];
  }
}

export async function getAllRealityLogs(db: Firestore, userId: string): Promise<RealityLog[]> {
  if (!db.type) return [];
  const colRef = collection(db, 'users', userId, 'realityLogs');
  const q = query(colRef, orderBy('date', 'desc'));
  
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RealityLog));
  } catch (error) {
    return [];
  }
}
