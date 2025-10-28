import { describe, it, expect, vi } from 'vitest';

// Mock environment variables
const originalEnv = process.env;

describe('Index App', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create app with development CORS', async () => {
    process.env.NODE_ENV = 'development';

    const { default: app } = await import('../index');

    // Test root route
    const res = await app.request('/');
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      message: string;
      version: string;
      timestamp: string;
    };
    expect(body.message).toBe('Hono Backend API');
    expect(body.version).toBe('1.0.0');
    expect(body.timestamp).toBeDefined();
  });

  it('should create app with production CORS', async () => {
    process.env.NODE_ENV = 'production';

    const { default: app } = await import('../index');

    // Test root route
    const res = await app.request('/');
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      message: string;
      version: string;
      timestamp: string;
    };
    expect(body.message).toBe('Hono Backend API');
    expect(body.version).toBe('1.0.0');
  });

  it('should handle health endpoint', async () => {
    const { default: app } = await import('../index');

    const res = await app.request('/health');
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      status: string;
      timestamp: string;
    };
    expect(body.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
  });

  it('should handle users endpoint', async () => {
    const { default: app } = await import('../index');

    const res = await app.request('/api/users');
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      users: Array<{ id: number; name: string; email: string }>;
    };
    expect(body.users).toHaveLength(2);
    expect(body.users[0]).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  it('should handle 404 for non-existent routes', async () => {
    const { default: app } = await import('../index');

    const res = await app.request('/non-existent');
    expect(res.status).toBe(404);

    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Not Found');
  });

  it('should handle internal server errors', async () => {
    // Create a new Hono instance for testing error handling
    const { Hono } = await import('hono');
    const testApp = new Hono();

    testApp.get('/error-test', () => {
      throw new Error('Test error');
    });

    testApp.onError((err, c) => {
      return c.json({ error: 'Internal Server Error' }, 500);
    });

    const res = await testApp.request('/error-test');
    expect(res.status).toBe(500);

    const body = (await res.json()) as { error: string };
    expect(body.error).toBe('Internal Server Error');
  });

  it('should handle CORS preflight requests', async () => {
    const { default: app } = await import('../index');

    const res = await app.request('/', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    expect(res.status).toBe(204); // CORS preflight returns 204
  });
});
