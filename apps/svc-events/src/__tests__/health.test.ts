import { describe, it, expect, vi } from 'vitest';

// Mock Prisma to avoid import issues
vi.mock('@repo/db', () => ({
  prisma: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

describe('Events Service Health Check', () => {
  it('should return 200 on health endpoint', async () => {
    const { default: app } = await import('../app');

    const res = await app.request('/health');
    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string; timestamp: string; uptime: number };
    expect(body.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
    expect(body.uptime).toBeDefined();
    expect(typeof body.uptime).toBe('number');
  });

  it('should return 200 on ready endpoint', async () => {
    const { default: app } = await import('../app');

    const res = await app.request('/health/ready');
    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string; timestamp: string };
    expect(body.status).toBe('ready');
    expect(body.timestamp).toBeDefined();
  });

  it('should return 200 on live endpoint', async () => {
    const { default: app } = await import('../app');

    const res = await app.request('/health/live');
    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string; timestamp: string };
    expect(body.status).toBe('alive');
    expect(body.timestamp).toBeDefined();
  });
});
