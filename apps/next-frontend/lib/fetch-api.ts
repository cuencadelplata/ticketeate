// Helper function to add API Key to fetch requests
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || 'ticketeate-frontend-prod-secret-key-2025';

interface FetchOptions extends RequestInit {
  skipApiKey?: boolean;
}

export async function fetchWithApiKey(url: string, options: FetchOptions = {}) {
  const { skipApiKey = false, ...init } = options;

  const headers = new Headers(init.headers);

  // Add API Key for production API endpoints (both /api and /production/api paths)
  // Skip for localhost and public health endpoints
  const isProductionEndpoint = (url: string) => {
    const isHealthCheck = url.includes('/health');
    const isLocalhost = url.includes('localhost');
    const isApiEndpoint = url.includes('/api/');
    return isApiEndpoint && !isHealthCheck && !isLocalhost;
  };

  if (!skipApiKey && isProductionEndpoint(url)) {
    headers.set('X-API-Key', API_KEY);
  }

  return fetch(url, {
    ...init,
    headers,
  });
}
