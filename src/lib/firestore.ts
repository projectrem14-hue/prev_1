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
 * Adds a new intention to the Firestore collection.
 */
export function addIntention(db: Firestore, data: Omit<Intention, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'intentions');
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
  };

  addDoc(colRef, payload).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: 'intentions',
      operation: 'create',
      requestResourceData: payload,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Adds a new reality log to the Firestore collection.
 */
export function addRealityLog(db: Firestore, data: Omit<RealityLog, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'realityLogs');
  const payload = {
    ...data,
    createdAt: serverTimestamp(),
  };

  addDoc(colRef, payload).catch(async (error) => {
    const permissionError = new FirestorePermissionError({
      path: 'realityLogs',
      operation: 'create',
      requestResourceData: payload,
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

/**
 * Fetches intentions for a specific date (YYYY-MM-DD).
 */
export async function getIntentionsByDate(db: Firestore, date: string): Promise<Intention[]> {
  const colRef = collection(db, 'intentions');
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
      path: 'intentions',
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    return [];
  }
}

/**
 * Fetches reality logs for a specific date (YYYY-MM-DD).
 */
export async function getRealityLogsByDate(db: Firestore, date: string): Promise<RealityLog[]> {
  const colRef = collection(db, 'realityLogs');
  const q = query(colRef, where('date', '==', date));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as RealityLog));
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: 'realityLogs',
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    return [];
  }
}

/**
 * Fetches all intentions.
 */
export async function getAllIntentions(db: Firestore): Promise<Intention[]> {
  const colRef = collection(db, 'intentions');
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
      path: 'intentions',
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    return [];
  }
}

/**
 * Fetches all reality logs.
 */
export async function getAllRealityLogs(db: Firestore): Promise<RealityLog[]> {
  const colRef = collection(db, 'realityLogs');
  const q = query(colRef, orderBy('date', 'desc'));
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as RealityLog));
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: 'realityLogs',
      operation: 'list',
    });
    errorEmitter.emit('permission-error', permissionError);
    return [];
  }
}
