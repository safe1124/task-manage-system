'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionId, setSessionId, clearSessionId } from '@/lib/auth';

interface User {
  id: string;
  name: string;
  mail: string;
  avatar_url?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginAsGuest: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // 환경변수 확인 및 프로덕션 환경 감지
  const getBackendUrl = () => {
    const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
    return process.env.NEXT_PUBLIC_BACKEND_URL || 
           (isProduction ? 'https://unique-perception-production.up.railway.app' : 'http://localhost:8000');
  };

  // 세션 확인 함수
  const checkSession = async () => {
    if (initialized) return; // 이미 초기화된 경우 재실행 방지
    
    try {
      const sessionId = getSessionId();
      console.log('Checking session:', sessionId);
      
      if (!sessionId) {
        console.log('No session ID found');
        setInitialized(true);
        setIsLoading(false);
        return;
      }

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Session valid, user data:', userData);
        setUser(userData);
      } else {
        console.log('Session invalid, clearing session');
        clearSessionId();
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      clearSessionId();
      setUser(null);
    } finally {
      setInitialized(true);
      setIsLoading(false);
    }
  };

  // 초기화 시에만 세션 확인
  useEffect(() => {
    checkSession();
  }, []); // 빈 dependency array로 한 번만 실행

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', username);

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ mail: username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful, data:', data);
        
        setSessionId(data.session_id);
        
        // 로그인 성공 후 사용자 정보 가져오기
        try {
          const userResponse = await fetch(`${backendUrl}/users/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.session_id}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
          }
        } catch (userError) {
          console.error('Failed to fetch user data after login:', userError);
        }
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting guest login');

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/users/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Guest login successful, data:', data);
        
        setSessionId(data.session_id);
        
        // 게스트 로그인 성공 후 사용자 정보 가져오기
        try {
          const userResponse = await fetch(`${backendUrl}/users/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${data.session_id}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser({ ...userData, isGuest: true });
          }
        } catch (userError) {
          console.error('Failed to fetch user data after guest login:', userError);
        }
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('Guest login failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Guest login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    
    const sessionId = getSessionId();
    if (sessionId) {
      try {
        const backendUrl = getBackendUrl();
        // 백엔드에 로그아웃 요청
        await fetch(`${backendUrl}/users/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionId}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
      } catch (error) {
        console.error('Logout request failed:', error);
      }
    }
    
    clearSessionId();
    setUser(null);
    
    // 로그아웃 후 auth 페이지로 리다이렉트
    router.push('/auth');
  };

  const reloadUser = async () => {
    const sessionId = getSessionId();
    if (!sessionId) return;

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionId}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to reload user:', error);
    }
  };

  const value = {
    user,
    login,
    loginAsGuest,
    logout,
    isLoading,
    reloadUser,
  };

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
