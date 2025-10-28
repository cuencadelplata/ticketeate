import { describe, it, expect } from 'vitest';
import { healthRoutes } from '../routes/health.js';

describe('Health Routes', () => {
  describe('GET /health/', () => {
    it('should return healthy status', async () => {
      const res = await healthRoutes.request('/');
      expect(res.status).toBe(200);

      const body = (await res.json()) as {
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
      };
      expect(body.status).toBe('healthy');
      expect(body.timestamp).toBeDefined();
      expect(body.uptime).toBeGreaterThanOrEqual(0);
      expect(body.environment).toBeDefined();
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready status', async () => {
      const res = await healthRoutes.request('/ready');
      expect(res.status).toBe(200);

      const body = (await res.json()) as {
        status: string;
        timestamp: string;
      };
      expect(body.status).toBe('ready');
      expect(body.timestamp).toBeDefined();
    });
  });

  describe('GET /health/live', () => {
    it('should return alive status', async () => {
      const res = await healthRoutes.request('/live');
      expect(res.status).toBe(200);

      const body = (await res.json()) as {
        status: string;
        timestamp: string;
      };
      expect(body.status).toBe('alive');
      expect(body.timestamp).toBeDefined();
    });
  });
});
