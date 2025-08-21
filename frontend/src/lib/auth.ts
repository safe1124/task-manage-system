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


