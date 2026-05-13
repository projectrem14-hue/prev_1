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
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Correctly handle client-side initialization to avoid hydration mismatches
    const savedUser = localStorage.getItem('gaplogic_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('gaplogic_session');
      }
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
