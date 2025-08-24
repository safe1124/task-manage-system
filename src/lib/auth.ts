// Get backend URL from environment variables
function getBackendUrl(): string {
  // 프로덕션 환경 감지
  const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  return process.env.NEXT_PUBLIC_BACKEND_URL || 
         (isProduction ? 'https://unique-perception-production.up.railway.app' : 'http://localhost:8000');
}

// Session-based auth - no token management needed
export function getToken(): string | null {
  // Deprecated but kept for compatibility
  return null;
}

export function setToken(token: string) {
  // Deprecated but kept for compatibility
}

export function clearToken() {
  // Logout handled by server  
  fetch(`${getBackendUrl()}/users/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  // 세션 ID도 클리어
  clearSessionId();
}

// 세션 ID 저장을 위한 로컬스토리지와 쿠키 통합 관리
let sessionId: string | null = null;

export function setSessionId(id: string) {
  sessionId = id;
  // 로컬스토리지에 저장 (새로고침 시에도 유지)
  if (typeof window !== 'undefined') {
    localStorage.setItem('session_id', id);
  }
  // 쿠키에도 백업으로 저장
  document.cookie = `session_id=${id}; path=/; max-age=${24*60*60}; samesite=lax`;
}

export function getSessionId(): string | null {
  // 메모리에 있으면 그것을 사용
  if (sessionId) {
    return sessionId;
  }
  
  // 브라우저 환경에서만 실행
  if (typeof window === 'undefined') {
    return null;
  }
  
  // 로컬스토리지에서 복원 시도
  const storedSessionId = localStorage.getItem('session_id');
  if (storedSessionId) {
    sessionId = storedSessionId;
    return sessionId;
  }
  
  // 쿠키에서 복원 시도 (백업)
  const cookieMatch = document.cookie.match(/session_id=([^;]+)/);
  if (cookieMatch) {
    sessionId = cookieMatch[1];
    // 로컬스토리지에도 동기화
    localStorage.setItem('session_id', sessionId);
    return sessionId;
  }
  
  return null;
}

export function clearSessionId() {
  sessionId = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('session_id');
  }
  document.cookie = 'session_id=; path=/; max-age=0; samesite=lax';
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  // Convert /api/ URLs to direct backend URLs
  let url: string;
  if (typeof input === 'string') {
    if (input.startsWith('/api/')) {
      url = `${getBackendUrl()}${input.replace('/api', '')}`;
    } else {
      url = input;
    }
  } else if (input instanceof URL) {
    url = input.toString();
  } else {
    url = input.url;
  }
  
  // 세션 ID를 Authorization 헤더로 전송 (CORS 환경에서 더 안정적)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>)
  };
  
  if (sessionId) {
    headers['Authorization'] = `Bearer ${sessionId}`;
  }
  
  // Include cookies automatically for session-based auth (백업)
  return fetch(url, { 
    ...init, 
    credentials: 'include',
    headers
  });
}


