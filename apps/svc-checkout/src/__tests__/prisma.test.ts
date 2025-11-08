import { describe, it, expect, vi } from 'vitest';

// Mock de Prisma usando vi.hoisted para evitar problemas de hoisting
const mockPrisma = vi.hoisted(() => ({
  user: vi.fn(),
  eventos: vi.fn(),
}));

vi.mock('@repo/db', () => ({
  prisma: mockPrisma,
}));

import { prisma } from '../config/prisma';

describe('Prisma Config', () => {
  it('should export prisma instance', () => {
    expect(prisma).toBe(mockPrisma);
  });

  it('should have prisma instance available', () => {
    expect(mockPrisma).toBeDefined();
    expect(typeof mockPrisma).toBe('object');
  });
});
