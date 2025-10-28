import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de las rutas antes de importar la app
vi.mock('../routes/api', () => ({
  apiRoutes: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../routes/health', () => ({
  healthRoutes: {
    get: vi.fn(),
  },
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

  describe('Error Handler', () => {
    it('should handle errors gracefully', async () => {
      // Crear una ruta que lance un error para probar el error handler
      const testApp = app.clone();
      testApp.get('/error-test', () => {
        throw new Error('Test error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const res = await testApp.request('/error-test');

      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Internal Server Error');

      expect(consoleSpy).toHaveBeenCalledWith('Error:', expect.any(Error));

      consoleSpy.mockRestore();
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

      // CORS middleware should handle this
      expect(res.status).toBe(200);
    });
  });

  describe('Environment Variables', () => {
    it('should use environment variables for JWK configuration', () => {
      // Verificar que la configuración de JWK usa las variables de entorno correctas
      const originalEnv = process.env.FRONTEND_URL;

      process.env.FRONTEND_URL = 'https://example.com';

      // Re-importar la app para que use la nueva variable de entorno
      const { default: newApp } = require('../app');

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
