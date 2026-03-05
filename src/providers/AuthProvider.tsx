'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  getSession,
  onAuthChange,
} from '@/services/auth';
import type { AuthUser, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((u) => {
      setUser(u);
      setLoading(false);
    });

    const cleanup = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });

    return cleanup;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authSignIn(email, password);
    if (result.user) setUser(result.user);
    return { error: result.error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const result = await authSignUp(email, password, name);
    if (result.user) setUser(result.user);
    return { error: result.error };
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
