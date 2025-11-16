import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import { cors } from 'hono/cors';
import { apiRoutes } from './routes/api';
import { logger } from './logger';
import { PUBLIC_ENDPOINTS } from './config/auth';

// Enable strict: false to handle both /path and /path/ routes
const app = new Hono({ strict: false });

// Helper to add CORS headers to error responses
// API Gateway only adds CORS to successful responses, not errors
const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = [
    'https://ticketeate.com.ar',
    'https://www.ticketeate.com.ar',
    'http://localhost:3000',
  ];

  const corsOrigin =
    origin && allowedOrigins.includes(origin) ? origin : 'https://ticketeate.com.ar';

  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With, Cookie',
  };
};

// CORS middleware - Apply in all environments
// In production, also add explicit headers since API Gateway may not handle all responses
app.use(
  '*',
  cors({
    origin: (origin) => {
      const allowedOrigins = [
        'https://ticketeate.com.ar',
        'https://www.ticketeate.com.ar',
        'http://localhost:3000',
      ];
      return origin && allowedOrigins.includes(origin) ? origin : 'https://ticketeate.com.ar';
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type', 'X-Requested-With', 'Cookie'],
    exposeHeaders: ['*'],
    credentials: true,
    maxAge: 86400,
  }),
);

// Additional CORS headers middleware for error responses
// Ensures CORS headers are present even on 401/404/500 responses
app.use('*', async (c, next) => {
  await next();

  const origin = c.req.header('origin');
  if (
    origin &&
    [
      'https://ticketeate.com.ar',
      'https://www.ticketeate.com.ar',
      'http://localhost:3000',
    ].includes(origin)
  ) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    c.header(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type, X-Requested-With, Cookie',
    );
  }
});

// Explicit OPTIONS handler for CORS preflight - MUST be before auth middleware
app.options('*', (c) => {
  const origin = c.req.header('origin');
  return c.text('', 200, getCorsHeaders(origin));
});

// Middleware
app.use('*', honoLogger());

// Authentication middleware for protected endpoints
app.use('*', async (c, next) => {
  const path = c.req.path;
  const method = c.req.method;

  // Skip validation for OPTIONS requests (CORS preflight)
  // This allows the OPTIONS handler to respond with CORS headers
  // without requiring authentication
  if (method === 'OPTIONS') {
    return next();
  }

  // Skip validation for public endpoints
  if (PUBLIC_ENDPOINTS.some((endpoint) => path === endpoint || path.startsWith(endpoint + '/'))) {
    return next();
  }

  // For protected endpoints, require authentication
  // Check both /production prefix (direct AWS URL) and without it (custom domain)
  const isProtectedPath = path.startsWith('/production/api') || path.startsWith('/api');
  const isHealthCheck = path.endsWith('/health');

  if (isProtectedPath && !isHealthCheck) {
    const authHeader = c.req.header('Authorization');
    const hasCookie = c.req.header('cookie')?.includes('better_auth');

    // Require either Authorization header or valid session cookie
    if (!authHeader && !hasCookie) {
      const origin = c.req.header('origin');
      return c.json({ error: 'Unauthorized: Missing authentication' }, 401, getCorsHeaders(origin));
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
  const origin = c.req.header('origin');
  return c.json({ error: 'Not Found' }, 404, getCorsHeaders(origin));
});

// Error handler
app.onError((err, c) => {
  logger.error('Application error', {
    path: c.req.path,
    method: c.req.method,
    error: err instanceof Error ? err.message : String(err),
  });
  const origin = c.req.header('origin');
  return c.json({ error: 'Internal Server Error' }, 500, getCorsHeaders(origin));
});

export default app;

// For development, you can use Bun, Deno, or other runtimes
// This file can be imported and used with different adapters
