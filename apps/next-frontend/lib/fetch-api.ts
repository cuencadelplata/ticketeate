// Helper function to fetch API data with appropriate authentication
// - Public endpoints (like /api/events/all): no credentials needed
// - Protected endpoints (like /api/events): include session cookies

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// List of endpoints that are publicly accessible (don't require authentication)
const PUBLIC_PATHS = ['/api/events/all', '/api/events/public', '/health', '/cors-debug'];

function isPublicEndpoint(url: string): boolean {
  try {
    const urlObj = new URL(
      url,
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost',
    );
    const pathname = urlObj.pathname;
    return PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + '/') || pathname.includes(path),
    );
  } catch {
    return false;
  }
}

export async function fetchWithApiKey(url: string, options: FetchOptions = {}) {
  const { skipAuth = false, ...init } = options;

  const headers = new Headers(init.headers);

  // For public endpoints, don't send credentials
  // For protected endpoints, include session cookies
  const isPublic = isPublicEndpoint(url);
  const shouldIncludeCredentials = !skipAuth && !isPublic;

  return fetch(url, {
    ...init,
    headers,
    credentials: shouldIncludeCredentials ? 'include' : 'omit',
  });
}
