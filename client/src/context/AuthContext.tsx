'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '@/services/authService';
import type { AuthResult } from '@/services/authService';
import type { User } from '@/types/api';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (input: { fullName: string; email?: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'aether.auth';

function applyAuth(result: AuthResult) {
  const value = { token: result.accessToken, user: result.user };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  return value;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { token?: string; user?: User };
        if (parsed.token && parsed.user) { setToken(parsed.token); setUser(parsed.user); }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const response = await authService.login(identifier, password);
    const auth = applyAuth(response.data);
    setToken(auth.token);
    setUser(auth.user);
  }, []);

  const register = useCallback(async (input: { fullName: string; email?: string; phone: string; password: string }) => {
    const response = await authService.register(input);
    const auth = applyAuth(response.data);
    setToken(auth.token);
    setUser(auth.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const hasPermission = useCallback((permission: string) => user?.permissions.includes(permission) ?? false, [user]);
  const value = useMemo(() => ({ user, token, loading, login, register, logout, hasPermission }), [user, token, loading, login, register, logout, hasPermission]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
