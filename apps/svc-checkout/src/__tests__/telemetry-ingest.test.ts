import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the telemetry package with an inline factory (hoisted safely)
vi.mock('@ticketeate/telemetry', () => ({
  recordPurchaseConfirmed: vi.fn(),
  recordPurchaseCancelled: vi.fn(),
  recordPurchaseError: vi.fn(),
}));

let telemetry: any;
import { api as apiRoutes } from '../routes/api';

describe('Telemetry ingest endpoint', () => {
  beforeEach(async () => {
    telemetry = await vi.importMock('@ticketeate/telemetry');
    (telemetry.recordPurchaseConfirmed as any).mockClear();
    (telemetry.recordPurchaseCancelled as any).mockClear();
    (telemetry.recordPurchaseError as any).mockClear();
  });

  it('accepts purchase_confirmed with secret and calls recordPurchaseConfirmed', async () => {
    process.env.TELEMETRY_INGEST_SECRET = 'test-secret';

    const body = JSON.stringify({ type: 'purchase_confirmed', eventId: 'e-1', userId: 'u-1', attrs: { gateway: 'mp' } });
    const req = new Request('http://localhost/telemetry/ingest', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-telemetry-secret': 'test-secret' },
      body,
    });

    const res = await (apiRoutes as any).fetch(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect((telemetry.recordPurchaseConfirmed as any)).toHaveBeenCalledTimes(1);
    expect((telemetry.recordPurchaseConfirmed as any)).toHaveBeenCalledWith({ eventId: 'e-1', userId: 'u-1', gateway: 'mp' });
  });

  it('returns 400 for unknown event type', async () => {
    const body = JSON.stringify({ type: 'unknown_type' });
    const req = new Request('http://localhost/telemetry/ingest', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    });

    const res = await (apiRoutes as any).fetch(req);
    expect(res.status).toBe(400);
  });
});
