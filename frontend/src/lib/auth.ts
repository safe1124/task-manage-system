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

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  if (response.status === 401) {
    // Redirect to login page on authentication failure
    window.location.href = '/auth';
  }

  return response;
}


