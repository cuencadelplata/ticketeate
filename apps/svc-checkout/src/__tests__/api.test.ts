import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de Clerk Auth
vi.mock('@hono/clerk-auth', () => ({
  clerkMiddleware: vi.fn(() => (c: any, next: any) => next()),
  getAuth: vi.fn(),
}));

// Mock de las rutas de eventos
vi.mock('../routes/events', () => ({
  events: new Hono(),
}));

import { Hono } from 'hono';
import { apiRoutes } from '../routes/api';
import { getAuth } from '@hono/clerk-auth';

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/users/:id', () => {
    it('should return user data when authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });

      const res = await apiRoutes.request('/users/123');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('id', 123);
      expect(body).toHaveProperty('name', 'John Doe');
      expect(body).toHaveProperty('email', 'john@example.com');
      expect(body).toHaveProperty('authenticatedUserId', 'user-123');
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue(null);

      const res = await apiRoutes.request('/users/123');

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 401 when userId is missing', async () => {
      vi.mocked(getAuth).mockReturnValue({});

      const res = await apiRoutes.request('/users/123');

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('POST /api/users', () => {
    it('should create user when authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });

      const userData = { name: 'Jane Doe', email: 'jane@example.com' };

      const res = await apiRoutes.request('/users', {
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
      vi.mocked(getAuth).mockReturnValue(null);

      const userData = { name: 'Jane Doe', email: 'jane@example.com' };

      const res = await apiRoutes.request('/users', {
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
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });

      const userData = { name: 'Jane Updated', email: 'jane.updated@example.com' };

      const res = await apiRoutes.request('/users/123', {
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
      vi.mocked(getAuth).mockReturnValue(null);

      const userData = { name: 'Jane Updated', email: 'jane.updated@example.com' };

      const res = await apiRoutes.request('/users/123', {
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
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });

      const res = await apiRoutes.request('/users/123', {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('message', 'User deleted successfully');
      expect(body).toHaveProperty('id', 123);
      expect(body).toHaveProperty('authenticatedUserId', 'user-123');
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue(null);

      const res = await apiRoutes.request('/users/123', {
        method: 'DELETE',
      });

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('GET /api/protected/profile', () => {
    it('should return profile data when authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue({ userId: 'user-123' });

      const res = await apiRoutes.request('/protected/profile');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty('message', 'This is a protected route');
      expect(body).toHaveProperty('user');
      expect(body.user).toHaveProperty('id', 'user-123');
      expect(body.user).toHaveProperty('name', 'John Doe');
      expect(body.user).toHaveProperty('role', 'admin');
    });

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getAuth).mockReturnValue(null);

      const res = await apiRoutes.request('/protected/profile');

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body).toHaveProperty('error', 'Unauthorized');
    });
  });
});
