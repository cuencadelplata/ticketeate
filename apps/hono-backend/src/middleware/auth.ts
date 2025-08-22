import { Context, Next } from 'hono';

export interface AuthContext extends Context {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (c: AuthContext, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization header required' }, 401);
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Here you would typically validate the JWT token
    // For demo purposes, we'll just check if it's not empty
    if (!token || token === 'invalid') {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Mock user data - in real app, decode JWT and get user info
    c.user = {
      id: '1',
      email: 'user@example.com',
      role: 'user',
    };

    await next();
  } catch (error) {
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

export const requireRole = (requiredRole: string) => {
  return async (c: AuthContext, next: Next) => {
    if (!c.user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    if (c.user.role !== requiredRole && c.user.role !== 'admin') {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    await next();
  };
};
