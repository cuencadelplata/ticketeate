import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { apiRoutes } from './routes/api';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// Routes
app.get('/', (c) => {
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

app.get('/api/users', (c) => {
  return c.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ],
  });
});

// Montar las rutas de la API (incluye /api/events/*)
app.route('/api', apiRoutes);

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

// For development, you can use Bun, Deno, or other runtimes
// This file can be imported and used with different adapters
