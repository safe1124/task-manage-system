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
  fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  // Include cookies automatically for session-based auth
  return fetch(input, { 
    ...init, 
    credentials: 'include',
    headers: { ...(init.headers as Record<string, string>) }
  });
}


