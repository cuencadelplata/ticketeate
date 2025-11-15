import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import { cors } from 'hono/cors';
import { apiRoutes } from './routes/api';
import { logger } from './logger';
import { PUBLIC_ENDPOINTS } from './config/auth';

const app = new Hono();

// CORS middleware - Only apply in development (not behind API Gateway)
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

// Middleware
app.use('*', honoLogger());

// Authentication middleware for protected endpoints
app.use('*', async (c, next) => {
  const path = c.req.path;

  // Skip validation for public endpoints
  if (PUBLIC_ENDPOINTS.some((endpoint) => path === endpoint || path.startsWith(endpoint + '/'))) {
    return next();
  }

  // For protected endpoints, require authentication
  // In production, the frontend should have a valid session cookie from better-auth
  // If no Authorization header and no valid session cookie, the request is unauthorized
  if (path.startsWith('/production') && !path.startsWith('/production/health')) {
    const authHeader = c.req.header('Authorization');
    const hasCookie = c.req.header('cookie')?.includes('better_auth');

    // Require either Authorization header or valid session cookie
    if (!authHeader && !hasCookie) {
      return c.json({ error: 'Unauthorized: Missing authentication' }, 401);
    }
  }

  return next();
});

// Mount routes at both /api and /production/api paths
// Routes
app.get('/', (c) => {
  return c.json({
    message: 'Hono Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/production', (c) => {
  return c.json({
    message: 'Hono Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Debug endpoint to check CORS headers
app.get('/cors-debug', (c) => {
  return c.json({
    origin: c.req.header('Origin'),
    corsHeaders: {
      'Access-Control-Allow-Credentials': c.res.headers.get('Access-Control-Allow-Credentials'),
      'Access-Control-Allow-Origin': c.res.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': c.res.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': c.res.headers.get('Access-Control-Allow-Headers'),
    },
  });
});

app.get('/production/cors-debug', (c) => {
  return c.json({
    origin: c.req.header('Origin'),
    corsHeaders: {
      'Access-Control-Allow-Credentials': c.res.headers.get('Access-Control-Allow-Credentials'),
      'Access-Control-Allow-Origin': c.res.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': c.res.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': c.res.headers.get('Access-Control-Allow-Headers'),
    },
  });
});

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/production/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/users', (c) => {
  return c.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  });
});

app.get('/production/api/users', (c) => {
  return c.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  });
});

// Montar las rutas de la API at both paths
app.route('/api', apiRoutes);
app.route('/production/api', apiRoutes);

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

// For development, you can use Bun, Deno, or other runtimes
// This file can be imported and used with different adapters
