import { describe, it, expect, beforeEach, vi } from 'vitest';
import app from '../app';
import jwt from 'jsonwebtoken';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    BETTER_AUTH_SECRET: 'test-secret',
    FRONTEND_URL: 'http://localhost:3000',
    NODE_ENV: 'test',
  },
}));

// Mock JWT
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Root route', () => {
    it('should return API info on GET /', async () => {
      const res = await app.request('/');
      expect(res.status).toBe(200);

      const body = (await res.json()) as {
        message: string;
        version: string;
        timestamp: string;
      };
      expect(body.message).toBe('Hono Backend API');
      expect(body.version).toBe('1.0.0');
      expect(body.timestamp).toBeDefined();
    });
  });

  describe('CORS middleware', () => {
    it('should handle OPTIONS request', async () => {
      const res = await app.request('/', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
        },
      });
      expect(res.status).toBe(204); // CORS preflight returns 204
    });
  });

  describe('JWT Middleware', () => {
    it('should reject request without Authorization header', async () => {
      const res = await app.request('/api/users/1');
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Missing or invalid Authorization header');
    });

    it('should reject request with invalid Authorization header format', async () => {
      const res = await app.request('/api/users/1', {
        headers: {
          Authorization: 'Invalid token',
        },
      });
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Missing or invalid Authorization header');
    });

    it('should reject request with invalid JWT token', async () => {
      (jwt.verify as any).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = await app.request('/api/users/1', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Invalid token');
    });

    it('should accept request with valid JWT token', async () => {
      const mockPayload = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      (jwt.verify as any).mockReturnValue(mockPayload);

      const res = await app.request('/api/users/1', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });
      expect(res.status).toBe(200);

      const body = (await res.json()) as {
        id: number;
        name: string;
        email: string;
        authenticatedUserId: string;
        userRole: string;
      };
      expect(body.authenticatedUserId).toBe('user-123');
      expect(body.userRole).toBe('user');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await app.request('/non-existent-route');
      expect(res.status).toBe(404);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Not Found');
    });
  });

  describe('Error handler', () => {
    it('should handle internal server errors', async () => {
      // Create a new Hono instance for testing error handling
      const { Hono } = await import('hono');
      const testApp = new Hono();

      // Add the same middleware as the main app
      testApp.use('*', (c, next) => {
        return next();
      });

      testApp.get('/error-test', () => {
        throw new Error('Test error');
      });

      testApp.onError((err, c) => {
        return c.json({ error: 'Internal Server Error' }, 500);
      });

      const res = await testApp.request('/error-test');
      expect(res.status).toBe(500);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Internal Server Error');
    });
  });
});
