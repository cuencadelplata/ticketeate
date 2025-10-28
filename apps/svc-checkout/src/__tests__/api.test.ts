import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';

// Mock de las rutas de eventos
vi.mock('../routes/events', () => ({
  events: new Hono(),
}));

import { apiRoutes } from '../routes/api';

describe('API Routes', () => {
  let testApp: Hono;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a test app that includes middleware to set jwtPayload
    testApp = new Hono();
  });

  describe('GET /api/users/:id', () => {
    it('should return user data when authenticated', async () => {
      // Setup middleware to mock JWT payload
      testApp.use('*', async (c, next) => {
        c.set('jwtPayload', { id: 'user-123', role: 'admin' });
        await next();
      });
      testApp.route('/', apiRoutes);

      const res = await testApp.request('/users/123');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('id', 123);
      expect(body).toHaveProperty('name', 'John Doe');
      expect(body).toHaveProperty('email', 'john@example.com');
      expect(body).toHaveProperty('authenticatedUserId', 'user-123');
    });

    it('should return 401 when not authenticated', async () => {
      // No JWT payload set
      testApp.route('/', apiRoutes);

      const res = await testApp.request('/users/123');

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 401 when userId is missing', async () => {
      // Setup middleware with empty JWT payload
      testApp.use('*', async (c, next) => {
        c.set('jwtPayload', {});
        await next();
      });
      testApp.route('/', apiRoutes);

      const res = await testApp.request('/users/123');

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('POST /api/users', () => {
    it('should create user when authenticated', async () => {
      // Setup middleware to mock JWT payload
      testApp.use('*', async (c, next) => {
        c.set('jwtPayload', { id: 'user-123', role: 'admin' });
        await next();
      });
      testApp.route('/', apiRoutes);

      const userData = { name: 'Jane Doe', email: 'jane@example.com' };

      const res = await testApp.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body).toHaveProperty('message', 'User created successfully');
      expect(body).toHaveProperty('user', userData);
      expect(body).toHaveProperty('authenticatedUserId', 'user-123');
    });

    it('should return 401 when not authenticated', async () => {
      // No JWT payload set
      testApp.route('/', apiRoutes);

      const userData = { name: 'Jane Doe', email: 'jane@example.com' };

      const res = await testApp.request('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user when authenticated', async () => {
      // Setup middleware to mock JWT payload
      testApp.use('*', async (c, next) => {
        c.set('jwtPayload', { id: 'user-123', role: 'admin' });
        await next();
      });
      testApp.route('/', apiRoutes);

      const userData = { name: 'Jane Updated', email: 'jane.updated@example.com' };

      const res = await testApp.request('/users/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('message', 'User updated successfully');
      expect(body).toHaveProperty('id', 123);
      expect(body).toHaveProperty('user', userData);
      expect(body).toHaveProperty('authenticatedUserId', 'user-123');
    });

    it('should return 401 when not authenticated', async () => {
      // No JWT payload set
      testApp.route('/', apiRoutes);

      const userData = { name: 'Jane Updated', email: 'jane.updated@example.com' };

      const res = await testApp.request('/users/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user when authenticated', async () => {
      // Setup middleware to mock JWT payload
      testApp.use('*', async (c, next) => {
        c.set('jwtPayload', { id: 'user-123', role: 'admin' });
        await next();
      });
      testApp.route('/', apiRoutes);

      const res = await testApp.request('/users/123', {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('message', 'User deleted successfully');
      expect(body).toHaveProperty('id', 123);
      expect(body).toHaveProperty('authenticatedUserId', 'user-123');
    });

    it('should return 401 when not authenticated', async () => {
      // No JWT payload set
      testApp.route('/', apiRoutes);

      const res = await testApp.request('/users/123', {
        method: 'DELETE',
      });

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('GET /api/protected/profile', () => {
    it('should return profile data when authenticated', async () => {
      // Setup middleware to mock JWT payload
      testApp.use('*', async (c, next) => {
        c.set('jwtPayload', {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
        });
        await next();
      });
      testApp.route('/', apiRoutes);

      const res = await testApp.request('/protected/profile');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('message', 'This is a protected route');
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id', 'user-123');
      expect(body.user).toHaveProperty('name', 'John Doe');
      expect(body.user).toHaveProperty('role', 'admin');
    });

    it('should return 401 when not authenticated', async () => {
      // No JWT payload set
      testApp.route('/', apiRoutes);

      const res = await testApp.request('/protected/profile');

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });
  });
});
