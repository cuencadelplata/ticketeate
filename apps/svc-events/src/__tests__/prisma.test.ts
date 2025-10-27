import { describe, it, expect, vi } from 'vitest';

// Mock Prisma client
vi.mock('@repo/db', () => ({
  prisma: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

describe('Prisma Config', () => {
  it('should export prisma instance', async () => {
    const prisma = await import('../config/prisma');

    expect(prisma.prisma).toBeDefined();
  });
});
