import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Intention, RealityLog } from './schema';

/**
 * Adds a new intention to the Firestore collection.
 * Following Firebase Studio guidelines: mutation is non-blocking (no await).
 */
export function addIntention(data: Omit<Intention, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'intentions');
  addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/**
 * Adds a new reality log to the Firestore collection.
 * Following Firebase Studio guidelines: mutation is non-blocking (no await).
 */
export function addRealityLog(data: Omit<RealityLog, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'realityLogs');
  addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
}

/**
 * Fetches intentions for a specific date (YYYY-MM-DD).
 */
export async function getIntentionsByDate(date: string): Promise<Intention[]> {
  const colRef = collection(db, 'intentions');
  const q = query(
    colRef, 
    where('date', '==', date), 
    orderBy('scheduledTime', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as Intention));
}

/**
 * Fetches reality logs for a specific date (YYYY-MM-DD).
 */
export async function getRealityLogsByDate(date: string): Promise<RealityLog[]> {
  const colRef = collection(db, 'realityLogs');
  const q = query(colRef, where('date', '==', date));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as RealityLog));
}

/**
 * Fetches all intentions ordered by date descending.
 */
export async function getAllIntentions(): Promise<Intention[]> {
  const colRef = collection(db, 'intentions');
  const q = query(
    colRef, 
    orderBy('date', 'desc'), 
    orderBy('scheduledTime', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as Intention));
}

/**
 * Fetches all reality logs ordered by date descending.
 */
export async function getAllRealityLogs(): Promise<RealityLog[]> {
  const colRef = collection(db, 'realityLogs');
  const q = query(colRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  } as RealityLog));
}
