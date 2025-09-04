import { Hono } from 'hono';

const health = new Hono();

health.get('/', c => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

health.get('/ready', c => {
  // Add your readiness checks here (database connection, external services, etc.)
  return c.json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

health.get('/live', c => {
  // Add your liveness checks here
  return c.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export { health as healthRoutes };
