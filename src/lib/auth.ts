// Get backend URL from environment variables
function getBackendUrl(): string {
  // 프로덕션 환경 감지
  const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  return process.env.NEXT_PUBLIC_BACKEND_URL || 
         (isProduction ? 'https://unique-perception-production.up.railway.app' : 'http://localhost:8600');
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

// 세션 ID 저장을 위한 간단한 저장소
let sessionId: string | null = null;

export function setSessionId(id: string) {
  sessionId = id;
  // 쿠키에도 백업으로 저장
  document.cookie = `session_id=${id}; path=/; max-age=${24*60*60}; samesite=none; secure`;
}

export function getSessionId(): string | null {
  return sessionId;
}

export function clearSessionId() {
  sessionId = null;
  document.cookie = 'session_id=; path=/; max-age=0; samesite=none; secure';
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


