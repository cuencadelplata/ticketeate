import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';

// Import routes
import { apiRoutes } from './routes/api';
import { healthRoutes } from './routes/health';
import { clerkMiddleware } from '@hono/clerk-auth';

const app = new Hono();
app.use('*', clerkMiddleware());
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
  })
);

// Routes
app.route('/api', apiRoutes);
app.route('/health', healthRoutes);

// Root route|
app.get('/', c => {
  return c.json({
    message: 'Hono Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.notFound(c => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  // eslint-disable-next-line no-console
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
