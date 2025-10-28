import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Prisma to avoid import issues
vi.mock('@repo/db', () => ({
  prisma: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /users/:id', () => {
    it('should return 401 when no JWT payload', async () => {
      const { apiRoutes } = await import('../routes/api.js');

      const res = await apiRoutes.request('/users/123');
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Unauthorized',
      });
    });
  });

  describe('POST /users', () => {
    it('should return 401 when no JWT payload', async () => {
      const { apiRoutes } = await import('../routes/api.js');

      const res = await apiRoutes.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test User' }),
      });
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Unauthorized',
      });
    });
  });

  describe('PUT /users/:id', () => {
    it('should return 401 when no JWT payload', async () => {
      const { apiRoutes } = await import('../routes/api.js');

      const res = await apiRoutes.request('/users/123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Updated User' }),
      });
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Unauthorized',
      });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should return 401 when no JWT payload', async () => {
      const { apiRoutes } = await import('../routes/api.js');

      const res = await apiRoutes.request('/users/123', {
        method: 'DELETE',
      });
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Unauthorized',
      });
    });
  });

  describe('GET /protected/profile', () => {
    it('should return 401 when no JWT payload', async () => {
      const { apiRoutes } = await import('../routes/api.js');

      const res = await apiRoutes.request('/protected/profile');
      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toEqual({
        error: 'Unauthorized',
      });
    });
  });
});
