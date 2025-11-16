import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import { cors } from 'hono/cors';
import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { apiRoutes } from './routes/api';
import { logger } from './logger';
import { PUBLIC_ENDPOINTS } from './config/auth';

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

// Custom JWT middleware using shared secret (same as frontend)
async function jwtMiddleware(c: Context, next: Next) {
  try {
    const path = c.req.path;

    // Skip JWT validation only for exact public endpoints (not subroutes)
    if (PUBLIC_ENDPOINTS.includes(path)) {
      return next();
    }

    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const origin = c.req.header('origin');
      return c.json(
        { error: 'Missing or invalid Authorization header' },
        401,
        getCorsHeaders(origin),
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token using shared secret (same as frontend)
    const jwtIssuer = process.env.JWT_ISSUER || process.env.FRONTEND_URL || 'http://localhost:3000';
    const jwtAudience =
      process.env.JWT_AUDIENCE || process.env.FRONTEND_URL || 'http://localhost:3000';

    const payload = jwt.verify(token, process.env.BETTER_AUTH_SECRET!, {
      issuer: jwtIssuer,
      audience: jwtAudience,
      algorithms: ['HS256'], // Specify algorithm
    });

    // Store JWT payload in context
    c.set('jwtPayload', payload);

    await next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('JWT Middleware - JWT verification failed:', error);
    const origin = c.req.header('origin');
    return c.json({ error: 'Invalid token' }, 401, getCorsHeaders(origin));
  }
}

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

  // Skip OPTIONS requests (CORS preflight) - don't validate auth
  if (c.req.method === 'OPTIONS') {
    return await next();
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

// JWT Authentication middleware for protected API routes
app.use('/api/*', jwtMiddleware);

// Handle OPTIONS requests (preflight) for all routes
// This is needed for tests and any direct calls to Hono
// The Lambda wrapper also handles OPTIONS, but this ensures Hono handles it too
app.options('*', (c) => {
  return c.text('');
});

// Note: CORS is handled 100% by the Lambda handler wrapper (lambda.ts)
// This is necessary because:
// 1. Hono CORS middleware sets headers on the Hono Response object
// 2. @hono/aws-lambda handler returns a plain object, losing those headers
// 3. API Gateway v2 filters headers if it handles CORS itself
// 4. Solution: Lambda wrapper sets CORS headers directly on the response object

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
