import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { apiRoutes } from './routes/api';
import { logger } from './logger';

const app = new Hono();

// Middleware
app.use('*', honoLogger());

// Log environment for debugging
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Hardcoded allowed origins to avoid undefined issues
const allowedOrigins = [
  'https://ticketeate.com.ar',
  'https://www.ticketeate.com.ar',
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(
  '*',
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  }),
);

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
