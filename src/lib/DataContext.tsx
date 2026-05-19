'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Intention, RealityLog } from './schema';

export const PUBLIC_USER_ID = 'default-user';
const INTENTIONS_KEY = 'gaplogic_intentions';
const LOGS_KEY = 'gaplogic_logs';

interface DataContextType {
  intentions: Intention[];
  logs: RealityLog[];
  loading: boolean;
}

const DataContext = createContext<DataContextType>({
  intentions: [],
  logs: [],
  loading: true,
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    const localIntentions = localStorage.getItem(INTENTIONS_KEY);
    const localLogs = localStorage.getItem(LOGS_KEY);
    
    setIntentions(localIntentions ? JSON.parse(localIntentions) : []);
    setLogs(localLogs ? JSON.parse(localLogs) : []);
    setLoading(false);
  };

  useEffect(() => {
    // Initial load
    loadData();

    // Sync across tabs/windows
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <DataContext.Provider value={{ intentions, logs, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
