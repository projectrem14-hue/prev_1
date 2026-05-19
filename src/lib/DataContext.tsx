
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Intention, RealityLog } from './schema';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
  const { user } = useAuth();
  const db = useFirestore();
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [logs, setLogs] = useState<RealityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !user) {
      if (user === null) setLoading(false);
      return;
    }

    setLoading(true);

    const intentionsRef = collection(db, 'users', user.uid, 'intentions');
    const intentionsQuery = query(intentionsRef, orderBy('createdAt', 'desc'));
    
    const unsubIntentions = onSnapshot(intentionsQuery, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Intention));
        setIntentions(data);
        setLoading(false);
      },
      (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: intentionsRef.path,
          operation: 'list',
        }));
        setLoading(false);
      }
    );

    const logsRef = collection(db, 'users', user.uid, 'realityLogs');
    const logsQuery = query(logsRef, orderBy('createdAt', 'desc'));
    
    const unsubLogs = onSnapshot(logsQuery, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RealityLog));
        setLogs(data);
      },
      (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: logsRef.path,
          operation: 'list',
        }));
      }
    );

    return () => {
      unsubIntentions();
      unsubLogs();
    };
  }, [db, user]);

  return (
    <DataContext.Provider value={{ intentions, logs, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
