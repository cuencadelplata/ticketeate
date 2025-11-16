import { Hono, Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { timing } from 'hono/timing';
import jwt from 'jsonwebtoken';
import './types/hono';
import { apiRoutes } from './routes/api';
import { healthRoutes } from './routes/health';
import { logger } from './logger';

// Custom JWT middleware using shared secret (same as frontend)
async function jwtMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.error('JWT Middleware - Missing or invalid Authorization header');
      return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token using shared secret (same as frontend)
    const jwtIssuer = process.env.JWT_ISSUER || process.env.FRONTEND_URL || 'http://localhost:3000';
    const jwtAudience =
      process.env.JWT_AUDIENCE || process.env.FRONTEND_URL || 'http://localhost:3000';

    try {
      const payload = jwt.verify(token, process.env.BETTER_AUTH_SECRET!, {
        issuer: jwtIssuer,
        audience: jwtAudience,
        algorithms: ['HS256'],
      });

      // Store JWT payload in context
      c.set('jwtPayload', payload);
    } catch (verifyError) {
      // En desarrollo, intentar verificar sin validar issuer/audience
      if (process.env.NODE_ENV === 'development') {
        logger.warn('JWT verification failed with issuer/audience, trying without validation', {
          error: verifyError instanceof Error ? verifyError.message : String(verifyError),
        });

        try {
          const payload = jwt.verify(token, process.env.BETTER_AUTH_SECRET!, {
            algorithms: ['HS256'],
          });
          c.set('jwtPayload', payload);
        } catch (fallbackError) {
          logger.error('JWT Middleware - Token verification failed', {
            error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
          });
          return c.json({ error: 'Invalid token' }, 401);
        }
      } else {
        logger.error('JWT Middleware - Token verification failed', {
          error: verifyError instanceof Error ? verifyError.message : String(verifyError),
        });
        return c.json({ error: 'Invalid token' }, 401);
      }
    }

    await next();
  } catch (error) {
    logger.error('JWT Middleware - Unexpected error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json({ error: 'Internal server error' }, 500);
  }
}

const app = new Hono();

// Middleware
app.use('*', honoLogger());
app.use('*', timing());

// CORS middleware - Always apply in development
// In production, API Gateway handles CORS headers
if (process.env.NODE_ENV !== 'production') {
  app.use(
    '*',
    cors({
      origin: (origin) => origin ?? '*',
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
      exposeHeaders: ['*'],
      credentials: true,
      maxAge: 86400,
    }),
  );
}

// JWT Authentication middleware for protected routes
// Skip OPTIONS requests (CORS preflight)
app.use('/api/*', async (c, next) => {
  if (c.req.method === 'OPTIONS') {
    return await next();
  }
  return await jwtMiddleware(c, next);
});

// Routes
app.route('/api', apiRoutes);
app.route('/health', healthRoutes);

// Root route
app.get('/', (c) => {
  return c.json({
    message: 'Hono Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  logger.error('Application error', {
    path: c.req.path,
    method: c.req.method,
    error: err instanceof Error ? err.message : String(err),
  });
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
