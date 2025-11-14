// Helper function to ensure authentication token is included in fetch requests
// This is used for protected API endpoints that require authentication

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function fetchWithApiKey(url: string, options: FetchOptions = {}) {
  const { skipAuth = false, ...init } = options;

  const headers = new Headers(init.headers);

  // For authenticated endpoints, we rely on the Authorization header
  // that should already be set by better-auth via cookies or explicit header
  // No need to manually add anything - just let the request flow through
  // The backend will validate the session token if needed

  return fetch(url, {
    ...init,
    headers,
    credentials: 'include', // Important: include cookies for session
  });
}
