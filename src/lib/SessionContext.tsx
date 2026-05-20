'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const USERS_KEY = 'gaplogic_users';
const SESSION_KEY = 'gaplogic_session';

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (sessionData) {
      try {
        setUser(JSON.parse(sessionData));
      } catch (e) {
        console.error('Failed to restore session:', e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as Array<User & { password: string }>;
    const foundUser = users.find(u => u.email === email);

    if (!foundUser || foundUser.password !== password) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword as User);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
  };

  const register = async (email: string, password: string, name: string) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]') as Array<User & { password: string }>;
    
    if (users.some(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser: User & { password: string } = {
      id: Math.random().toString(36).substring(2, 15),
      email,
      name,
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword as User);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <SessionContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
