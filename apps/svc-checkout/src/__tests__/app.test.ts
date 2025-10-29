import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';

// Mock de las rutas antes de importar la app
vi.mock('../routes/api', () => ({
  apiRoutes: new Hono(),
}));

vi.mock('../routes/health', () => ({
  healthRoutes: new Hono(),
}));

import app from '../app';

describe('App', () => {
  describe('Root Route', () => {
    it('should return API info on GET /', async () => {
      const res = await app.request('/');

      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body).toHaveProperty('message', 'Hono Backend API');
      expect(body).toHaveProperty('version', '1.0.0');
      expect(body).toHaveProperty('timestamp');
      expect(new Date(body.timestamp as string)).toBeInstanceOf(Date);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await app.request('/non-existent-route');

      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Not Found');
    });
  });

  describe('CORS Configuration', () => {
    it('should handle OPTIONS requests', async () => {
      const res = await app.request('/', {
        method: 'OPTIONS',
        headers: {
          Origin: 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
        },
      });

      // CORS middleware returns 204 for OPTIONS requests
      expect(res.status).toBe(204);
    });
  });
});
