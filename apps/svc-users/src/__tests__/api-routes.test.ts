import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiRoutes } from '../routes/api.js';

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/users/:id', () => {
    it('should return 401 when JWT payload is missing', async () => {
      const res = await apiRoutes.request('/users/1');
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/users', () => {
    it('should return 401 when JWT payload is missing', async () => {
      const res = await apiRoutes.request('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test' }),
      });
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Unauthorized');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should return 401 when JWT payload is missing', async () => {
      const res = await apiRoutes.request('/users/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test' }),
      });
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should return 401 when JWT payload is missing', async () => {
      const res = await apiRoutes.request('/users/1', {
        method: 'DELETE',
      });
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/protected/profile', () => {
    it('should return 401 when JWT payload is missing', async () => {
      const res = await apiRoutes.request('/protected/profile');
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Unauthorized');
    });
  });
});
