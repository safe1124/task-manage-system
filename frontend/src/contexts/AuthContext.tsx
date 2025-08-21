"use client";
// Updated for Vercel deployment - ESLint errors fixed
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authFetch } from '@/lib/auth';
interface UserProfile {
  id: string;
  name: string;
  mail: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: () => Promise<boolean>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use environment variable for API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_BASE}/users/me`);
        if (res.ok) {
          setUser(await res.json());
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuthState();
  }, []);

  const login = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/users/me`);
      if (res.ok) {
        setUser(await res.json());
        setLoading(false);
        return true;
      }
    } catch {
      console.error("Failed to fetch user after login");
    }
    // If login process fails, reset to a clean logged-out state.
    setUser(null);
    setLoading(false);
    return false;
  };

  const logout = async () => {
    // Use window location to force a full refresh, clearing all states.
    window.location.href = '/auth';
  };

  const reloadUser = async () => {
      setLoading(true);
      const res = await authFetch(`${API_BASE}/users/me`);
      if (res.ok) {
        setUser(await res.json());
      } else {
        // If reloading user fails (e.g. session expired), log out completely.
        logout();
      }
      setLoading(false);
  };

  const value = { user, loading, login, logout, reloadUser };

  return (
    <AuthContext.Provider value={value}>
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
