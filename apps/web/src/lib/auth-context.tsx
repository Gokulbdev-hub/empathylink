'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { PersonaSummary, UserRole, UniverseKey } from '@empathylink/types';

interface User {
  id: string;
  email: string;
  role: UserRole;
  persona: PersonaSummary;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, initialUniverse: UniverseKey) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('el_access_token');
      if (token) {
        try {
          const res = await api.request('/auth/verify');
          if (res.user) {
             setUser(res.user);
          } else {
             api.clearTokens();
          }
        } catch (error) {
          api.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    const accessToken = res.tokens?.accessToken || res.accessToken;
    const refreshToken = res.tokens?.refreshToken || res.refreshToken;
    api.setTokens(accessToken, refreshToken);
    setUser(res.user);
  };

  const register = async (email: string, password: string, displayName: string, initialUniverse: UniverseKey) => {
    const res = await api.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName, initialUniverse }),
    });

    const accessToken = res.tokens?.accessToken || res.accessToken;
    const refreshToken = res.tokens?.refreshToken || res.refreshToken;
    api.setTokens(accessToken, refreshToken);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.request('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      api.clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
