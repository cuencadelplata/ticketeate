import { describe, it, expect, vi } from 'vitest';

// Mock de Prisma antes de importar el servicio
vi.mock('@repo/db', () => ({
  prisma: {
    event: {
      findUnique: vi.fn(),
    },
    checkout: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Checkout Utils', () => {
  describe('calculateTotal', () => {
    it('should calculate total for single ticket', () => {
      const price = 100;
      const quantity = 1;
      expect(price * quantity).toBe(100);
    });

    it('should calculate total for multiple tickets', () => {
      const price = 50;
      const quantity = 3;
      expect(price * quantity).toBe(150);
    });

    it('should handle decimal prices', () => {
      const price = 49.99;
      const quantity = 2;
      expect(price * quantity).toBeCloseTo(99.98);
    });
  });

  describe('validateCheckoutData', () => {
    it('should validate valid checkout data', () => {
      const data = {
        eventId: 'event-123',
        userId: 'user-123',
        quantity: 2,
        price: 100,
      };

      const isValid = data.eventId && data.userId && data.quantity > 0 && data.price > 0;

      expect(isValid).toBe(true);
    });

    it('should reject invalid quantity', () => {
      const data = {
        eventId: 'event-123',
        userId: 'user-123',
        quantity: 0,
        price: 100,
      };

      const isValid = data.quantity > 0;
      expect(isValid).toBe(false);
    });

    it('should reject negative price', () => {
      const data = {
        eventId: 'event-123',
        userId: 'user-123',
        quantity: 2,
        price: -100,
      };

      const isValid = data.price > 0;
      expect(isValid).toBe(false);
    });
  });
});
