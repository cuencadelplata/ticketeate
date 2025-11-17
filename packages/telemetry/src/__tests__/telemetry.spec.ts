import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the metrics module used by Telemetry so we can assert interactions
vi.mock('../config/metrics', () => {
  const purchaseCounter = { add: vi.fn() };
  const queueLengthHistogram = { record: vi.fn() };
  const processingTimeHistogram = { record: vi.fn() };
  const activeUsersGauge = { addCallback: vi.fn() };

  return {
    initMetrics: vi.fn(() => ({
      purchaseCounter,
      queueLengthHistogram,
      processingTimeHistogram,
      activeUsersGauge,
    })),
  };
});

describe('Telemetry (package)', () => {
  beforeEach(() => {
    // Ensure modules are reloaded between tests so singletons reset
    vi.resetModules();
  });

  it('initializes metrics and records purchase', async () => {
    const metricsModule = await import('../config/metrics');
    const { Telemetry } = await import('../index');

    const t = Telemetry.init({ serviceName: 'test-service' });
    t.recordPurchase(42);

    expect(metricsModule.initMetrics).toHaveBeenCalledWith('test-service');
    const metrics = (metricsModule as any).initMetrics();
    expect(metrics.purchaseCounter.add).toHaveBeenCalledWith(1, { amount: '42' });
  });

  it('records queue length, processing time and updates active users', async () => {
    const metricsModule = await import('../config/metrics');
    const { Telemetry } = await import('../index');

    const t = Telemetry.init({ serviceName: 'svc' });
    t.recordQueueLength(7);
    t.recordProcessingTime(150);
    t.updateActiveUsers(3);

    const metrics = (metricsModule as any).initMetrics();
    expect(metrics.queueLengthHistogram.record).toHaveBeenCalledWith(7);
    expect(metrics.processingTimeHistogram.record).toHaveBeenCalledWith(150);
    expect(metrics.activeUsersGauge.addCallback).toHaveBeenCalled();
  });
});
