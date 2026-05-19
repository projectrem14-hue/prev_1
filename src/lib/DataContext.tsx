'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useFirestore } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
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
      setIntentions([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Real-time listener for Intentions
    const intentionsRef = collection(db, 'users', user.uid, 'intentions');
    const intentionsQuery = query(intentionsRef, orderBy('date', 'desc'), orderBy('scheduledTime', 'asc'));
    
    const unsubIntentions = onSnapshot(intentionsQuery, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Intention));
        setIntentions(data);
        setLoading(false);
      },
      (error) => {
        const permissionError = new FirestorePermissionError({
          path: intentionsRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    // Real-time listener for Reality Logs
    const logsRef = collection(db, 'users', user.uid, 'realityLogs');
    const logsQuery = query(logsRef, orderBy('date', 'desc'));
    
    const unsubLogs = onSnapshot(logsQuery, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RealityLog));
        setLogs(data);
      },
      (error) => {
        const permissionError = new FirestorePermissionError({
          path: logsRef.path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
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
