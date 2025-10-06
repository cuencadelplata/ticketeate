import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import { jwk } from 'hono/jwk';

// Import routes
import { apiRoutes } from './routes/api';
import { healthRoutes } from './routes/health';

const app = new Hono();

// Middleware
app.use('*', logger());
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

// JWK Authentication middleware for protected routes
app.use(
  '/api/*',
  jwk({
    jwks_uri: process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/.well-known/jwks.json`
      : 'http://localhost:3000/.well-known/jwks.json',
    allow_anon: false, // Require authentication for API routes
  }),
);

// Routes
app.route('/api', apiRoutes);
app.route('/health', healthRoutes);

// Root route|
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
  // eslint-disable-next-line no-console
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
