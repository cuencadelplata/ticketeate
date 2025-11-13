import { Context, Next } from 'hono';

/**
 * Simple in-memory rate limiter
 * Para producción, usar Redis para rate limiting distribuido
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimiterOptions {
  windowMs: number; // Ventana de tiempo en ms
  limit: number; // Máximo de requests en la ventana
  message?: string; // Mensaje personalizado
}

/**
 * Limpia entradas expiradas del store
 */
function cleanupStore() {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

// Limpiar store cada minuto
setInterval(cleanupStore, 60000);

/**
 * Middleware de rate limiting para Hono
 * @param options Configuración del rate limiter
 */
export function rateLimiter(options: RateLimiterOptions) {
  const { windowMs, limit, message = 'Too many requests, please try again later.' } = options;

  return async (c: Context, next: Next) => {
    // Obtener IP del cliente
    const clientIp =
      c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
      c.req.header('x-real-ip') ||
      'unknown';

    const key = `ratelimit:${clientIp}`;
    const now = Date.now();

    // Inicializar o obtener datos del cliente
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    store[key].count++;

    // Headers informativos
    const remaining = Math.max(0, limit - store[key].count);
    const resetTime = Math.ceil(store[key].resetTime / 1000);

    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', resetTime.toString());

    // Verificar si se excedió el límite
    if (store[key].count > limit) {
      c.header('Retry-After', Math.ceil((store[key].resetTime - now) / 1000).toString());
      return c.json(
        {
          error: message,
          retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
        },
        429,
      );
    }

    await next();
  };
}

/**
 * Rate limiter predefinido para uso general
 * 100 requests por 15 minutos
 */
export const generalRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 100,
  message: 'Demasiadas solicitudes, por favor intenta de nuevo más tarde.',
});

/**
 * Rate limiter estricto para endpoints sensibles
 * 10 requests por 15 minutos
 */
export const strictRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10,
  message: 'Has excedido el límite de solicitudes para esta acción. Intenta más tarde.',
});
