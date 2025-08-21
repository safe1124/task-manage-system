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

// Use same-origin API via Next.js rewrite to Railway
const API_BASE = "/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      setLoading(true);
      try {
        // Don't auto-redirect on initial auth check to prevent infinite loops
        const res = await authFetch(`${API_BASE}/users/me`, {}, false);
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Clear user state but don't redirect
          setUser(null);
        }
      } catch (error) {
        console.log("Authentication check failed:", error);
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
      // Don't auto-redirect during login process
      const res = await authFetch(`${API_BASE}/users/me`, {}, false);
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setLoading(false);
        return true;
      }
    } catch (error) {
      console.error("Failed to fetch user after login:", error);
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
      try {
        // Allow auto-redirect for manual reload requests
        const res = await authFetch(`${API_BASE}/users/me`, {}, true);
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // If reloading user fails (e.g. session expired), clear user state
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to reload user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
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
