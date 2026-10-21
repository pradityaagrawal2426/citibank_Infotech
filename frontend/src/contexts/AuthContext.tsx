import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

interface User {
  id: number;
  username: string;
  role: 'student' | 'facilitator' | 'admin';
  is_demo: boolean;
  preferred_language?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  demoLogin: (persona: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('raahsetu_token');
    const storedUser = localStorage.getItem('raahsetu_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    const res = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = res.data;
    localStorage.setItem('raahsetu_token', data.access_token);
    const userObj: User = {
      id: data.user_id,
      username: data.username,
      role: data.role,
      is_demo: data.is_demo,
    };
    localStorage.setItem('raahsetu_user', JSON.stringify(userObj));
    setToken(data.access_token);
    setUser(userObj);
  };

  const demoLogin = async (persona: string) => {
    const res = await api.post('/auth/demo-login', { persona });
    const data = res.data;
    localStorage.setItem('raahsetu_token', data.access_token);
    const userObj: User = {
      id: data.user_id,
      username: data.username,
      role: data.role,
      is_demo: data.is_demo,
    };
    localStorage.setItem('raahsetu_user', JSON.stringify(userObj));
    setToken(data.access_token);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('raahsetu_token');
    localStorage.removeItem('raahsetu_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      demoLogin,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
