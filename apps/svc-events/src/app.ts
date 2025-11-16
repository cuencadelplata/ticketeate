import { Hono, Context, Next } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import jwt from 'jsonwebtoken';
import { apiRoutes } from './routes/api';
import { healthRoutes } from './routes/health';

// Custom JWT middleware using shared secret (same as frontend)
async function jwtMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token using shared secret (same as frontend)
    const frontendUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://ticketeate.com.ar'
        : process.env.FRONTEND_URL || 'http://localhost:3000';

    const payload = jwt.verify(token, process.env.BETTER_AUTH_SECRET!, {
      issuer: frontendUrl,
      audience: frontendUrl,
      algorithms: ['HS256'], // Specify algorithm
    });

    // Store JWT payload in context
    c.set('jwtPayload', payload);

    await next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('JWT Middleware - JWT verification failed:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
}

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', timing());
// CORS configuration with environment-aware origins
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://ticketeate.com.ar',
      'https://www.ticketeate.com.ar',
    ];

const allowedOrigins = corsOrigins.filter(Boolean);

app.use(
  '*',
  cors({
    origin: allowedOrigins,
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
