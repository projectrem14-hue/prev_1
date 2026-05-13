
/**
 * Mock Firestore Implementation using LocalStorage.
 * This ensures the app works without a real Firebase configuration.
 */

import { Intention, RealityLog } from './schema';

const getStore = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStore = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export function addIntention(userId: string, data: Omit<Intention, 'id' | 'createdAt'>) {
  const key = `gaplogic_intentions_${userId}`;
  const store = getStore<Intention>(key);
  const newItem: Intention = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any
  };
  setStore(key, [...store, newItem]);
}

export function addRealityLog(userId: string, data: Omit<RealityLog, 'id' | 'createdAt'>) {
  const key = `gaplogic_logs_${userId}`;
  const store = getStore<RealityLog>(key);
  const newItem: RealityLog = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any
  };
  setStore(key, [...store, newItem]);
}

export async function getIntentionsByDate(db: any, userId: string, date: string): Promise<Intention[]> {
  const store = getStore<Intention>(`gaplogic_intentions_${userId}`);
  return store
    .filter(i => i.date === date)
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
}

export async function getRealityLogsByDate(db: any, userId: string, date: string): Promise<RealityLog[]> {
  const store = getStore<RealityLog>(`gaplogic_logs_${userId}`);
  return store.filter(l => l.date === date);
}

export async function getAllIntentions(db: any, userId: string): Promise<Intention[]> {
  const store = getStore<Intention>(`gaplogic_intentions_${userId}`);
  return store.sort((a, b) => b.date.localeCompare(a.date) || a.scheduledTime.localeCompare(b.scheduledTime));
}

export async function getAllRealityLogs(db: any, userId: string): Promise<RealityLog[]> {
  const store = getStore<RealityLog>(`gaplogic_logs_${userId}`);
  return store.sort((a, b) => b.date.localeCompare(a.date));
}
