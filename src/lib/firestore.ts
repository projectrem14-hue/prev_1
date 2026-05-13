
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import { Intention, RealityLog } from './schema';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Adds a new intention to the user's specific Firestore collection.
 */
export function addIntention(db: Firestore, userId: string, data: Omit<Intention, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'users', userId, 'intentions');
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
  };

  addDoc(colRef, payload).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/intentions`,
      operation: 'create',
      requestResourceData: payload,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Adds a new reality log to the user's specific Firestore collection.
 */
export function addRealityLog(db: Firestore, userId: string, data: Omit<RealityLog, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'users', userId, 'realityLogs');
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
  };

  addDoc(colRef, payload).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/realityLogs`,
      operation: 'create',
      requestResourceData: payload,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Fetches intentions for a specific date (YYYY-MM-DD) for a specific user.
 */
export async function getIntentionsByDate(db: Firestore, userId: string, date: string): Promise<Intention[]> {
  const colRef = collection(db, 'users', userId, 'intentions');
  const q = query(
    colRef, 
    where('date', '==', date), 
    orderBy('scheduledTime', 'asc')
  );
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Intention));
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/intentions`,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    return [];
  }
}

/**
 * Fetches reality logs for a specific date (YYYY-MM-DD) for a specific user.
 */
export async function getRealityLogsByDate(db: Firestore, userId: string, date: string): Promise<RealityLog[]> {
  const colRef = collection(db, 'users', userId, 'realityLogs');
  const q = query(colRef, where('date', '==', date));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as RealityLog));
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/realityLogs`,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    return [];
  }
}

/**
 * Fetches all intentions for a specific user.
 */
export async function getAllIntentions(db: Firestore, userId: string): Promise<Intention[]> {
  const colRef = collection(db, 'users', userId, 'intentions');
  const q = query(
    colRef, 
    orderBy('date', 'desc'), 
    orderBy('scheduledTime', 'asc')
  );
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as Intention));
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/intentions`,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    return [];
  }
}

/**
 * Fetches all reality logs for a specific user.
 */
export async function getAllRealityLogs(db: Firestore, userId: string): Promise<RealityLog[]> {
  const colRef = collection(db, 'users', userId, 'realityLogs');
  const q = query(colRef, orderBy('date', 'desc'));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as RealityLog));
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: `users/${userId}/realityLogs`,
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    return [];
  }
}
