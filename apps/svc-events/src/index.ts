import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { events } from './routes/events';

const app = new Hono();

// CORS middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint
app.get('/health', c => {
  return c.json({ status: 'ok', service: 'svc-events' });
});

// Mount events routes
app.route('/api/events', events);

// 404 handler
app.notFound(c => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = process.env.PORT || 3001;

console.log(`🚀 Events service running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
