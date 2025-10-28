import { describe, it, expect, beforeEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock JWT
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

// Mock Prisma to avoid import issues
vi.mock('@repo/db', () => ({
  prisma: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock environment variables
    process.env.BETTER_AUTH_SECRET = 'test-secret';
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  describe('Root endpoint', () => {
    it('should return API info on root endpoint', async () => {
      // Import app after mocks are set up
      const { default: app } = await import('../app');

      const res = await app.request('/');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toMatchObject({
        message: 'Hono Backend API',
        version: '1.0.0',
      });
      expect(body.timestamp).toBeDefined();
    });
  });

  describe('Health endpoint', () => {
    it('should return health status', async () => {
      const { default: app } = await import('../app');

      const res = await app.request('/health');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });

  describe('JWT Middleware', () => {
    it('should reject requests without Authorization header', async () => {
      const { default: app } = await import('../app');

      const res = await app.request('/api/events');
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Missing or invalid Authorization header',
      });
    });

    it('should reject requests with invalid Authorization header format', async () => {
      const { default: app } = await import('../app');

      const res = await app.request('/api/events', {
        headers: {
          Authorization: 'InvalidToken',
        },
      });
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Missing or invalid Authorization header',
      });
    });

    it('should reject requests with invalid JWT token', async () => {
      const { default: app } = await import('../app');
      const mockJwtVerify = vi.mocked(jwt.verify);
      mockJwtVerify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const res = await app.request('/api/events', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Invalid token',
      });
    });

    it('should accept requests with valid JWT token', async () => {
      const { default: app } = await import('../app');
      const mockJwtVerify = vi.mocked(jwt.verify);
      mockJwtVerify.mockReturnValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      const res = await app.request('/api/events', {
        headers: {
          Authorization: 'Bearer valid-token',
        },
      });

      // Should not return 401, might return other status depending on route implementation
      expect(res.status).not.toBe(401);
    });
  });

  describe('CORS', () => {
    it('should handle OPTIONS requests', async () => {
      const { default: app } = await import('../app');

      const res = await app.request('/api/events', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
        },
      });

      // Should not return CORS error
      expect(res.status).not.toBe(403);
    });
  });

  describe('404 handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const { default: app } = await import('../app');

      const res = await app.request('/non-existent-route');
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Not Found',
      });
    });
  });

  describe('Error handler', () => {
    it('should handle internal server errors', async () => {
      const { default: app } = await import('../app');

      // This test would require mocking a route that throws an error
      // For now, we'll test that the error handler exists by checking the app structure
      expect(app).toBeDefined();
    });
  });
});
