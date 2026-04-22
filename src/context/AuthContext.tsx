import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AUTH_STORAGE_KEY } from '@/api/axios.client';

// TODO: Remplacer par un vrai appel API lors de l'intégration backend
const DEMO_USER = {
  token: 'demo-token',
  email: 'demo@wantzenau.fr',
  role: 'Agent',
  mairieId: 1,
  mairieName: 'La Wantzenau',
  mairieCode: 'LW001',
  centerLat: 48.6579,
  centerLng: 7.8307,
};

export interface AuthUser {
  token: string;
  email: string;
  role: string;
  mairieId: number;
  mairieName: string;
  mairieCode: string;
  centerLat: number;
  centerLng: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = AUTH_STORAGE_KEY;

const AuthContext = createContext<AuthContextValue | null>(null);

const loadFromStorage = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // Pour le démo : si une session existe, retourner toujours DEMO_USER à jour.
    // Évite d'avoir des données obsolètes (ex: ancienne ville) figées en localStorage.
    // TODO: Lors de l'intégration API, parser et valider le vrai token ici.
    const stored = JSON.parse(raw) as { token?: string };
    return stored?.token ? DEMO_USER : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(loadFromStorage);

  const login = useCallback(async (_email: string, _password: string) => {
    // TODO: await apiClient.post<AuthUser>('/auth/login', { email: _email, password: _password });
    const userData: AuthUser = DEMO_USER;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};
