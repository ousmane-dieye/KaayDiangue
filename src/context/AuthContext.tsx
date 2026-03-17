import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../lib/api';

interface User {
  id: number;
  username: string;
  role: 'student' | 'teacher' | 'admin';
  points: number;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: any) => Promise<any>;
  register: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const data = await apiRequest('/auth/me');
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function refreshUser() {
    await checkAuth();
  }

  async function login(credentials: any) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setUser(data.user);
    return data;
  }

  async function register(credentials: any) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setUser(data.user);
    return data;
  }

  async function logout() {
    await apiRequest('/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
