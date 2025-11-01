/**
 * Cliente HTTP para comunicación segura entre servicios
 */

import { generateServiceToken, SERVICE_IDS, type ServiceId } from './service-auth';

interface FetchOptions extends RequestInit {
  serviceId?: ServiceId;
  requireServiceAuth?: boolean;
}

/**
 * Fetch wrapper que agrega autenticación de servicio automáticamente
 */
export async function serviceFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const {
    serviceId = SERVICE_IDS.NEXT_FRONTEND,
    requireServiceAuth = true,
    headers = {},
    ...fetchOptions
  } = options;

  const requestHeaders: HeadersInit = { ...headers };

  // Agregar token de autenticación entre servicios si se requiere
  if (requireServiceAuth) {
    const serviceToken = await generateServiceToken(serviceId);
    (requestHeaders as Record<string, string>)['X-Service-Auth'] = `Bearer ${serviceToken}`;
  }

  return fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });
}

/**
 * Helper para hacer GET requests a servicios
 */
export async function serviceGet<T = any>(
  url: string,
  options: Omit<FetchOptions, 'method' | 'body'> = {}
): Promise<T> {
  const response = await serviceFetch(url, {
    ...options,
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Service request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Helper para hacer POST requests a servicios
 */
export async function servicePost<T = any>(
  url: string,
  body?: any,
  options: Omit<FetchOptions, 'method'> = {}
): Promise<T> {
  const response = await serviceFetch(url, {
    ...options,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Service request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Exportar servicios conocidos
export const SERVICES = {
  EVENTS: process.env.NEXT_PUBLIC_EVENTS_SERVICE_URL || 'http://localhost:3001',
  USERS: process.env.NEXT_PUBLIC_USERS_SERVICE_URL || 'http://localhost:3002',
  CHECKOUT: process.env.NEXT_PUBLIC_CHECKOUT_SERVICE_URL || 'http://localhost:3003',
  PRODUCERS: process.env.NEXT_PUBLIC_PRODUCERS_SERVICE_URL || 'http://localhost:3004',
};
