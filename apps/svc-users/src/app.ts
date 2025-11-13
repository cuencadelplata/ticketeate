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
      return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token using shared secret (same as frontend)
    const payload = jwt.verify(token, process.env.BETTER_AUTH_SECRET!, {
      issuer: process.env.FRONTEND_URL || 'http://localhost:3000',
      audience: process.env.FRONTEND_URL || 'http://localhost:3000',
      algorithms: ['HS256'], // Specify algorithm
    });

    // Store JWT payload in context
    c.set('jwtPayload', payload);

    await next();
  } catch (error) {
    logger.error('JWT Middleware - JWT verification failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return c.json({ error: 'Invalid token' }, 401);
  }
}

const app = new Hono();

// Middleware
app.use('*', honoLogger());
app.use('*', timing());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// JWT Authentication middleware for protected routes
app.use('/api/*', jwtMiddleware);

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
