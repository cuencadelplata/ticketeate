/**
 * Cliente HTTP para comunicación segura entre servicios
 */

import { generateServiceToken, SERVICE_IDS, type ServiceId } from './service-auth';
import {
  createServiceCircuitBreaker,
  type CircuitBreakerInstance,
} from './circuit-breaker';

// Circuit breakers por servicio - se crean una vez y se reutilizan
const circuitBreakers = new Map<string, CircuitBreakerInstance<[string, RequestInit], Response>>();

/**
 * Obtener o crear circuit breaker para un servicio
 */
function getCircuitBreakerForService(serviceName: string): CircuitBreakerInstance<[string, RequestInit], Response> {
  if (!circuitBreakers.has(serviceName)) {
    const breaker = createServiceCircuitBreaker(
      async (url: string, options: RequestInit = {}): Promise<Response> => {
        const response = await fetch(url, options);

        // Considerar errores HTTP 5xx como fallos del servicio (abren el circuito)
        // Los errores 4xx son errores del cliente, no del servicio, así que no abren el circuito
        if (response.status >= 500 && response.status < 600) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Los errores de red y timeouts también se consideran fallos
        // fetch() lanza excepciones para estos casos automáticamente

        return response;
      },
      serviceName,
    );
    circuitBreakers.set(serviceName, breaker);
  }

  return circuitBreakers.get(serviceName)!;
}

/**
 * Extraer nombre del servicio de la URL
 */
function extractServiceName(url: string): string {
  try {
    const urlObj = new URL(url);
    // Usar el hostname o path para identificar el servicio
    if (urlObj.hostname.includes('events') || url.includes('/api/events')) {
      return 'events';
    }
    if (urlObj.hostname.includes('users') || url.includes('/api/users')) {
      return 'users';
    }
    if (urlObj.hostname.includes('checkout') || url.includes('/api/checkout')) {
      return 'checkout';
    }
    if (urlObj.hostname.includes('producers') || url.includes('/api/producers')) {
      return 'producers';
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

interface FetchOptions extends RequestInit {
  serviceId?: ServiceId;
  requireServiceAuth?: boolean;
}

/**
 * Fetch wrapper que agrega autenticación de servicio automáticamente
 * Incluye protección con circuit breaker
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

  // Obtener circuit breaker para este servicio
  const serviceName = extractServiceName(url);
  const breaker = getCircuitBreakerForService(serviceName);

  // Ejecutar fetch a través del circuit breaker
  const response = await breaker.fire(url, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  return response;
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
