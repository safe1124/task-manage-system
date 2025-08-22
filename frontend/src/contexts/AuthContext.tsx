"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, setToken as setLocalStorageToken, clearToken, authFetch } from '@/lib/auth';
interface UserProfile {
  id: string;
  name: string;
  mail: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      setLoading(true);
      try {
        const res = await authFetch('/api/users/me');
        if (res.ok) {
          setUser(await res.json());
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      }
      setLoading(false);
    };
    checkAuthState();
  }, []);

  const login = async (sessionId: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log("Login attempt with sessionId:", sessionId);
      const res = await authFetch('/api/users/me');
      console.log("Profile fetch response:", res.status, res.ok);
      if (res.ok) {
        const userData = await res.json();
        console.log("User data received:", userData);
        setUser(userData);
        setLoading(false);
        return true;
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Profile fetch failed:", res.status, errorData);
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
    await clearToken(); // This now calls the logout endpoint
    setUser(null);
    // Use window location to force a full refresh, clearing all states.
    window.location.href = '/auth';
  };

  const reloadUser = async () => {
      setLoading(true);
      const res = await authFetch('/api/users/me');
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
