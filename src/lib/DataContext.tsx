
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useFirestore } from '@/firebase';
import { getAllIntentions, getAllRealityLogs } from './firestore';
import { Intention, RealityLog } from './schema';

interface DataContextType {
  intentions: Intention[];
  logs: RealityLog[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({
  intentions: [],
  logs: [],
  loading: true,
  refresh: async () => {},
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const db = useFirestore();
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!db || !user) return;
    // Don't set loading to true here to avoid flickering on manual refresh
    try {
      const [allInts, allLogs] = await Promise.all([
        getAllIntentions(db, user.uid),
        getAllRealityLogs(db, user.uid)
      ]);
      setIntentions(allInts);
      setLogs(allLogs);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [db, user]);

  useEffect(() => {
    if (user && db) {
      refresh();
    } else {
      setLoading(false);
    }
  }, [user, db, refresh]);

  return (
    <DataContext.Provider value={{ intentions, logs, loading, refresh }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
