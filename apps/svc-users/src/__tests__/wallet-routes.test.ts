import { describe, it, expect, beforeEach, vi } from 'vitest';
import { wallet } from '../routes/wallet';

describe('Wallet Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /wallet/', () => {
    it('should return 401 for unauthenticated user', async () => {
      const res = await wallet.request('/');
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Usuario no autenticado');
    });
  });

  describe('POST /wallet/link', () => {
    it('should return 401 for unauthenticated user', async () => {
      const res = await wallet.request('/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: 'mock' }),
      });
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Usuario no autenticado');
    });
  });

  describe('POST /wallet/unlink', () => {
    it('should return 401 for unauthenticated user', async () => {
      const res = await wallet.request('/unlink', {
        method: 'POST',
      });
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Usuario no autenticado');
    });
  });

  describe('POST /wallet/simulate-payment', () => {
    it('should return 401 for unauthenticated user', async () => {
      const res = await wallet.request('/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 100 }),
      });
      expect(res.status).toBe(401);

      const body = (await res.json()) as { error: string };
      expect(body.error).toBe('Usuario no autenticado');
    });
  });
});
