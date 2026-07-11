'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string; role: string } | null;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    const saved = localStorage.getItem('cctv-auth');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch {
        localStorage.removeItem('cctv-auth');
      }
    }
  }, []);

  const login = useCallback((username: string, password: string) => {
    // Mock authentication — admin/admin
    if (username === 'admin' && password === 'admin') {
      const next: AuthState = {
        isAuthenticated: true,
        user: { username: 'admin', role: 'Administrator' },
      };
      setState(next);
      localStorage.setItem('cctv-auth', JSON.stringify(next));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setState({ isAuthenticated: false, user: null });
    localStorage.removeItem('cctv-auth');
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
