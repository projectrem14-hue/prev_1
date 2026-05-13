'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface MockUser {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: () => {},
  logout: () => {}
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state directly from localStorage if available to avoid flashes
  const [user, setUser] = useState<MockUser | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gaplogic_session');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      // If we have a session, we aren't "loading" in a blocking sense
      return !localStorage.getItem('gaplogic_session');
    }
    return true;
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('gaplogic_session');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string) => {
    const newUser = { uid: btoa(email), email };
    setUser(newUser);
    localStorage.setItem('gaplogic_session', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gaplogic_session');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
