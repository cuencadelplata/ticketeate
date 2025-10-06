import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { timing } from 'hono/timing';
import { jwtVerify, createRemoteJWKSet } from 'jose';

// Import routes
import { apiRoutes } from './routes/api';
import { healthRoutes } from './routes/health';

// Create JWKS for JWT verification
const JWKS = createRemoteJWKSet(
  new URL(process.env.FRONTEND_URL 
    ? `${process.env.FRONTEND_URL}/api/auth/jwks`
    : 'http://localhost:3000/api/auth/jwks')
);

// Custom JWT middleware
async function jwtMiddleware(c: any, next: any) {
  console.log('🚀 JWT Middleware - STARTING - Processing request to:', c.req.path);
  try {
    console.log('JWT Middleware - Processing request to:', c.req.path);
    
    const authHeader = c.req.header('Authorization');
    console.log('JWT Middleware - Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('JWT Middleware - Missing or invalid Authorization header');
      return c.json({ error: 'Missing or invalid Authorization header' }, 401);
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('JWT Middleware - Token (first 20 chars):', token.substring(0, 20) + '...');
    
    // Verify JWT token
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.FRONTEND_URL || 'http://localhost:3000',
      audience: process.env.FRONTEND_URL || 'http://localhost:3000',
    });
    
    console.log('JWT Middleware - Token verified successfully, payload:', payload);
    
    // Store JWT payload in context
    c.set('jwtPayload', payload);
    
    await next();
  } catch (error) {
    console.error('JWT Middleware - JWT verification failed:', error);
    return c.json({ error: 'Invalid token' }, 401);
  }
}

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
