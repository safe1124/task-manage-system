"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // 로컬 스토리지에서 테마 설정 불러오기
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // 기본값은 다크모드
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // 테마 변경 시 로컬 스토리지에 저장
    localStorage.setItem('theme', theme);
    
    // HTML 요소에 테마 클래스 적용
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // CSS 변수 설정
    if (theme === 'light') {
      root.style.setProperty('--background-start-rgb', '248, 250, 252');
      root.style.setProperty('--background-end-rgb', '241, 245, 249');
      root.style.setProperty('--foreground-rgb', '15, 23, 42');
    } else {
      root.style.setProperty('--background-start-rgb', '11, 27, 59');
      root.style.setProperty('--background-end-rgb', '11, 27, 59');
      root.style.setProperty('--foreground-rgb', '255, 255, 255');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
