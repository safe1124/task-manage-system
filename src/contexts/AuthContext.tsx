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
  loginAsGuest: () => Promise<{ success: boolean; accountInfo?: { id: string; password: string } }>;
  logout: () => void;
  isLoading: boolean;
  reloadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
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
        
        // 게스트 세션 플래그 확인
        const isGuestSession = localStorage.getItem('is_guest_session') === 'true' || 
                              userData.name?.includes('体験ユーザー');
        
        if (isGuestSession) {
          console.log('Guest session detected, maintaining guest status');
          setUser({ ...userData, isGuest: true });
        } else {
          setUser(userData);
        }
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

  const loginAsGuest = async (): Promise<{ success: boolean; accountInfo?: { id: string; password: string } }> => {
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
        
        // 게스트 세션임을 표시
        if (typeof window !== 'undefined') {
          localStorage.setItem('is_guest_session', 'true');
        }
        
        // 게스트 로그인 성공 후 사용자 정보는 가져오지만 user 상태는 설정하지 않음
        // auth 페이지에서 모달이 표시된 후 수동으로 setUser를 호출할 예정
        let userData = null;
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
            userData = await userResponse.json();
          }
        } catch (userError) {
          console.error('Failed to fetch user data after guest login:', userError);
        }
        
        return { 
          success: true, 
          accountInfo: data.account_info
        };
      } else {
        const errorData = await response.json();
        console.error('Guest login failed:', errorData);
        return { success: false };
      }
    } catch (error) {
      console.error('Guest login error:', error);
      return { success: false };
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
    
    // 게스트 세션 플래그도 정리
    if (typeof window !== 'undefined') {
      localStorage.removeItem('is_guest_session');
    }
    
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
        // 현재 사용자가 게스트인 경우 플래그 유지
        const isCurrentlyGuest = user?.isGuest || 
                                localStorage.getItem('is_guest_session') === 'true' ||
                                userData.name?.includes('体験ユーザー');
        setUser({ ...userData, isGuest: isCurrentlyGuest });
      } else {
        console.error('Failed to reload user:', response.status);
        // 401 에러가 아닌 경우에만 사용자 상태 유지
        if (response.status !== 401) {
          return;
        }
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
    setUser,
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
