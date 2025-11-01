/**
 * Sistema de autenticación entre servicios (Service-to-Service Auth)
 * 
 * Genera y valida tokens JWT para comunicación segura entre:
 * - next-frontend <-> svc-events
 * - next-frontend <-> svc-users
 * - etc.
 */

import { SignJWT, jwtVerify } from 'jose';

// Secret compartido entre servicios (debe estar en .env)
const SERVICE_SECRET = process.env.SERVICE_AUTH_SECRET || 'default-service-secret-change-in-production';
const SECRET_KEY = new TextEncoder().encode(SERVICE_SECRET);

// Identificadores de servicios
export const SERVICE_IDS = {
  NEXT_FRONTEND: 'next-frontend',
  SVC_EVENTS: 'svc-events',
  SVC_USERS: 'svc-users',
  SVC_CHECKOUT: 'svc-checkout',
  SVC_PRODUCERS: 'svc-producers',
} as const;

export type ServiceId = (typeof SERVICE_IDS)[keyof typeof SERVICE_IDS];

interface ServiceTokenPayload {
  serviceId: ServiceId;
  iat: number;
  exp: number;
}

/**
 * Genera un token JWT para autenticación entre servicios
 * @param serviceId - Identificador del servicio que genera el token
 * @param expiresIn - Tiempo de expiración en segundos (default: 5 minutos)
 */
export async function generateServiceToken(
  serviceId: ServiceId,
  expiresIn: number = 300
): Promise<string> {
  const token = await new SignJWT({ serviceId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(SECRET_KEY);

  return token;
}

/**
 * Valida un token de servicio
 * @param token - Token JWT a validar
 * @returns Payload del token si es válido, null si no lo es
 */
export async function verifyServiceToken(token: string): Promise<ServiceTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });

    if (!payload.serviceId) {
      return null;
    }

    return payload as unknown as ServiceTokenPayload;
  } catch (error) {
    console.error('Invalid service token:', error);
    return null;
  }
}

/**
 * Middleware helper para validar tokens de servicio en APIs
 */
export function createServiceAuthHeader(serviceId: ServiceId): Promise<string> {
  return generateServiceToken(serviceId);
}

/**
 * Valida que el request venga de un servicio autorizado
 */
export async function validateServiceAuth(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  const payload = await verifyServiceToken(token);

  return payload !== null;
}
