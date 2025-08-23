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
      // 세션 쿠키가 설정될 시간을 충분히 줍니다
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Login attempt with sessionId:", sessionId);
      console.log("Current cookies:", document.cookie);
      
      // 여러 번 시도 (최대 5회)
      for (let attempt = 0; attempt < 5; attempt++) {
        const res = await authFetch('/api/users/me');
        console.log(`Profile fetch attempt ${attempt + 1} response:`, res.status, res.ok);
        
        if (res.ok) {
          const userData = await res.json();
          console.log("User data received:", userData);
          setUser(userData);
          setLoading(false);
          return true;
        } else {
          // 실패 시 잠시 대기 후 재시도
          if (attempt < 4) {
            console.log(`Retrying in ${(attempt + 1) * 700}ms...`);
            await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 700));
          } else {
            const errorData = await res.json().catch(() => ({}));
            console.error("All profile fetch attempts failed:", res.status, errorData);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch user after login:", error);
    }
    
    // 모든 프로필 가져오기 시도가 실패한 경우
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
