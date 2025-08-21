// Updated for Vercel deployment - ESLint errors fixed
export async function authFetch(url: string, options: RequestInit = {}, autoRedirect: boolean = false): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  // Only redirect if explicitly requested and not already on auth page
  if (response.status === 401 && autoRedirect && !window.location.pathname.includes('/auth')) {
    // Redirect to login page on authentication failure
    window.location.href = '/auth';
  }

  return response;
}


