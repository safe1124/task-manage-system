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
  
  // Include cookies automatically for session-based auth
  return fetch(url, { 
    ...init, 
    credentials: 'include',
    headers: { 
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>) 
    }
  });
}


