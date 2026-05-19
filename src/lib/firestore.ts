'use client';

import { Intention, RealityLog } from './schema';

const INTENTIONS_KEY = 'gaplogic_intentions';
const LOGS_KEY = 'gaplogic_logs';

function getLocalData<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setLocalData<T>(key: string, data: T[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
  // Dispatch event for cross-tab sync
  window.dispatchEvent(new Event('storage'));
}

export function addIntention(_db: any, _userId: string, data: Omit<Intention, 'id' | 'createdAt'>) {
  const intentions = getLocalData<Intention>(INTENTIONS_KEY);
  const newIntention: Intention = {
    ...data,
    id: Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString() as any, // Mocking Timestamp as ISO string for local storage
  };
  
  setLocalData(INTENTIONS_KEY, [newIntention, ...intentions]);
}

export function addRealityLog(_db: any, _userId: string, data: Omit<RealityLog, 'id' | 'createdAt'>) {
  const logs = getLocalData<RealityLog>(LOGS_KEY);
  const newLog: RealityLog = {
    ...data,
    id: Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString() as any,
  };
  
  setLocalData(LOGS_KEY, [newLog, ...logs]);
}
