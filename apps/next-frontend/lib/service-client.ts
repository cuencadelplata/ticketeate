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
  options: Omit<FetchOptions, 'method' | 'body'> = {},
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
  options: Omit<FetchOptions, 'method'> = {},
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

// Helper para obtener la URL base según el entorno
function getServiceUrl(
  publicEnvVar: string | undefined,
  serverEnvVar: string | undefined,
  defaultPort: number,
): string {
  // Priorizar variable de servidor (para SSR/Server Actions)
  if (serverEnvVar) {
    return serverEnvVar;
  }

  // Variable de entorno pública (disponible en cliente y servidor)
  if (publicEnvVar) {
    return publicEnvVar;
  }

  // En el cliente, detectar el entorno
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://localhost:${defaultPort}`;
    }
    // En producción en el cliente, usar el dominio actual
    return `${window.location.protocol}//${hostname}`;
  }

  // En el servidor en producción, usar API Gateway
  if (process.env.NODE_ENV === 'production') {
    return 'https://j5d9mwvxgh.execute-api.us-east-2.amazonaws.com/production';
  }

  // Fallback a localhost para desarrollo
  return `http://localhost:${defaultPort}`;
}

// Exportar servicios conocidos
export const SERVICES = {
  EVENTS: getServiceUrl(
    process.env.NEXT_PUBLIC_EVENTS_SERVICE_URL,
    process.env.EVENTS_SERVICE_URL,
    3001,
  ),
  USERS: getServiceUrl(
    process.env.NEXT_PUBLIC_USERS_SERVICE_URL,
    process.env.USERS_SERVICE_URL,
    3002,
  ),
  CHECKOUT: getServiceUrl(
    process.env.NEXT_PUBLIC_CHECKOUT_SERVICE_URL,
    process.env.CHECKOUT_SERVICE_URL,
    3003,
  ),
  PRODUCERS: getServiceUrl(
    process.env.NEXT_PUBLIC_PRODUCERS_SERVICE_URL,
    process.env.PRODUCERS_SERVICE_URL,
    3004,
  ),
};
