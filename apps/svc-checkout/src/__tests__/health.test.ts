import { describe, it, expect } from 'vitest';
import { healthRoutes } from '../routes/health';

describe('Health Routes', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await healthRoutes.request('/');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('status', 'healthy');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('uptime');
      expect(body).toHaveProperty('environment');

      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
      expect(typeof body.uptime).toBe('number');
      expect(typeof body.environment).toBe('string');
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready status', async () => {
      const res = await healthRoutes.request('/ready');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('status', 'ready');
      expect(body).toHaveProperty('timestamp');

      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /health/live', () => {
    it('should return alive status', async () => {
      const res = await healthRoutes.request('/live');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('status', 'alive');
      expect(body).toHaveProperty('timestamp');

      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
    });
  });
});

