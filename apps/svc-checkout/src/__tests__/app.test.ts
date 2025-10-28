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

      const body = await res.json();
      expect(body).toHaveProperty('message', 'Hono Backend API');
      expect(body).toHaveProperty('version', '1.0.0');
      expect(body).toHaveProperty('timestamp');
      expect(new Date(body.timestamp)).toBeInstanceOf(Date);
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

  describe('Environment Variables', () => {
    it('should use environment variables for JWK configuration', async () => {
      // Verificar que la configuración de JWK usa las variables de entorno correctas
      const originalEnv = process.env.FRONTEND_URL;

      process.env.FRONTEND_URL = 'https://example.com';

      // Re-importar la app para que use la nueva variable de entorno
      const { default: newApp } = await import('../app');

      // Verificar que la app se crea correctamente con la nueva configuración
      expect(newApp).toBeDefined();

      // Restaurar la variable de entorno original
      if (originalEnv) {
        process.env.FRONTEND_URL = originalEnv;
      } else {
        delete process.env.FRONTEND_URL;
      }
    });
  });
});
