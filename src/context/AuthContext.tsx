import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, tokenStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initAuth = async () => {
    const token = tokenStorage.get();
    if (!token) {
      // Default to demo user if no token exists, to give an immediate instant interactive experience!
      try {
        const res = await api.demoLogin('user');
        tokenStorage.set(res.token);
        setUser(res.user);
      } catch (err: any) {
        console.error('Failed to auto-init demo user:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err: any) {
      console.warn('Session expired or invalid, switching to demo user:', err);
      try {
        const res = await api.demoLogin('user');
        tokenStorage.set(res.token);
        setUser(res.user);
      } catch (e) {
        tokenStorage.clear();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await api.login({ email, password });
      tokenStorage.set(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    setError(null);
    try {
      const res = await api.register({ name, email, password, role });
      tokenStorage.set(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const demoLogin = async (role: UserRole) => {
    setError(null);
    try {
      const res = await api.demoLogin(role);
      tokenStorage.set(res.token);
      setUser(res.user);
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo account');
      throw err;
    }
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
