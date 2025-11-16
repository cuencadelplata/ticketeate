// Helper function to fetch API data with appropriate authentication
// - Public endpoints (like /api/events/all): no credentials needed
// - Protected endpoints (like /api/events): include session cookies

type RequestCredentialsType = 'omit' | 'include' | 'same-origin';

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

  // Crear Headers object combinando init.headers (si existe) con opciones adicionales
  const headers = new Headers(init.headers || {});

  // For public endpoints, don't send credentials
  // For protected endpoints, always include credentials (cookies + Authorization header)
  const isPublic = isPublicEndpoint(url);
  const hasAuthHeader = headers.has('Authorization');

  // Use 'include' for all protected endpoints to send both cookies and Authorization header
  // Use 'omit' only for public endpoints or when explicitly skipped
  const credentials: RequestCredentialsType = skipAuth || isPublic ? 'omit' : 'include';

  // Log for debugging - include ALL headers
  if (typeof window !== 'undefined') {
    const allHeaders: Record<string, string> = {};
    headers.forEach((value, key) => {
      allHeaders[key] = value.substring(0, 50);
    });
    console.log('[fetchWithApiKey] FULL HEADERS:', allHeaders);
    console.log('[fetchWithApiKey] REQUEST DETAILS:', {
      url,
      credentials,
      hasAuthHeader,
      authValue: headers.get('Authorization')?.substring(0, 50),
      authFullLength: headers.get('Authorization')?.length || 0,
      isPublic,
      method: init.method || 'GET',
      allHeaderKeys: Array.from(headers.keys()),
    });
  }

  const fetchRequest = {
    ...init,
    method: init.method || 'GET',
    headers, // Headers object - asegura que los headers se pasen correctamente
    credentials,
  };

  if (typeof window !== 'undefined') {
    console.log('[fetchWithApiKey] EXECUTING FETCH:', {
      url,
      requestHasHeaders: !!fetchRequest.headers,
      headersType: typeof fetchRequest.headers,
    });
  }

  return fetch(url, fetchRequest);
}
