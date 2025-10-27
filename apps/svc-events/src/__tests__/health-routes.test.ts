import { describe, it, expect } from 'vitest';
import { healthRoutes } from '../routes/health';

describe('Health Routes', () => {
  describe('GET /', () => {
    it('should return health status', async () => {
      const res = await healthRoutes.request('/');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
      });
    });
  });

  describe('GET /ready', () => {
    it('should return ready status', async () => {
      const res = await healthRoutes.request('/ready');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toMatchObject({
        status: 'ready',
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /live', () => {
    it('should return live status', async () => {
      const res = await healthRoutes.request('/live');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toMatchObject({
        status: 'alive',
        timestamp: expect.any(String),
      });
    });
  });
});

