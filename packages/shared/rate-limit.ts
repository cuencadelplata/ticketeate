/**
 * Rate Limiting Middleware para Hono
 * Previene abuso de APIs limitando el número de requests por IP
 */

import type { Context, Next } from 'hono';

interface RateLimitOptions {
  /**
   * Ventana de tiempo en milisegundos
   * @default 900000 (15 minutos)
   */
  windowMs?: number;

  /**
   * Máximo número de requests permitidos en la ventana
   * @default 100
   */
  limit?: number;

  /**
   * Mensaje de error personalizado
   */
  message?: string;

  /**
   * Función para extraer la clave de identificación (normalmente IP)
   */
  keyGenerator?: (c: Context) => string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Store en memoria para el rate limiting
 * En producción, considerar usar Redis para compartir entre instancias
 */
const store: RateLimitStore = {};

/**
 * Limpia entradas expiradas del store cada 60 segundos
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000);

/**
 * Middleware de rate limiting para Hono
 *
 * @example
 * ```typescript
 * import { rateLimiter } from '@repo/shared/rate-limit';
 *
 * app.use('*', rateLimiter({
 *   windowMs: 15 * 60 * 1000, // 15 minutos
 *   limit: 100, // máximo 100 requests
 * }));
 * ```
 */
export function rateLimiter(options: RateLimitOptions = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos por defecto
    limit = 100,
    message = 'Too many requests, please try again later.',
    keyGenerator = (c: Context) => {
      // Intentar obtener la IP real detrás de proxies
      return (
        c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
        c.req.header('x-real-ip') ||
        'unknown'
      );
    },
  } = options;

  return async (c: Context, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    // Inicializar o obtener el registro
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Incrementar contador
    store[key].count += 1;

    // Headers informativos para el cliente
    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, limit - store[key].count).toString());
    c.header('X-RateLimit-Reset', new Date(store[key].resetTime).toISOString());

    // Verificar si se excedió el límite
    if (store[key].count > limit) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      c.header('Retry-After', retryAfter.toString());

      return c.json(
        {
          error: message,
          retryAfter: retryAfter,
        },
        429,
      );
    }

    await next();
  };
}

/**
 * Variante de rate limiter más estricta para endpoints sensibles
 * (login, registro, cambio de contraseña, etc.)
 *
 * @example
 * ```typescript
 * import { strictRateLimiter } from '@repo/shared/rate-limit';
 *
 * app.post('/api/auth/login', strictRateLimiter(), async (c) => {
 *   // ...
 * });
 * ```
 */
export function strictRateLimiter(options: RateLimitOptions = {}) {
  return rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    limit: 5, // solo 5 intentos
    message: 'Too many attempts from this IP, please try again after 15 minutes.',
    ...options,
  });
}

/**
 * Rate limiter personalizado para APIs públicas
 */
export function apiRateLimiter(options: RateLimitOptions = {}) {
  return rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minuto
    limit: 60, // 60 requests por minuto
    ...options,
  });
}
