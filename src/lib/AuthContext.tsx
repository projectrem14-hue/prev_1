
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface MockUser {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('gaplogic_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('gaplogic_user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();

    // Listen for custom auth events from our mock auth service
    window.addEventListener('auth-state-change', checkAuth);
    // Listen for storage changes in other tabs
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('auth-state-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
