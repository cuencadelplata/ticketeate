import { initTracing } from './config/tracing';
import { initMetrics } from './config/metrics';

export interface TelemetryConfig {
  serviceName: string;
}

export class Telemetry {
  private static instance: Telemetry;
  private metrics: ReturnType<typeof initMetrics>;

  private constructor(config: TelemetryConfig) {
    initTracing(config.serviceName);
    this.metrics = initMetrics(config.serviceName);
  }

  public static init(config: TelemetryConfig): Telemetry {
    if (!Telemetry.instance) {
      Telemetry.instance = new Telemetry(config);
    }
    return Telemetry.instance;
  }

  public recordPurchase(amount: number) {
    this.metrics.purchaseCounter.add(1, { amount: amount.toString() });
  }

  public recordQueueLength(length: number) {
    this.metrics.queueLengthHistogram.record(length);
  }

  public recordProcessingTime(milliseconds: number) {
    this.metrics.processingTimeHistogram.record(milliseconds);
  }

  public updateActiveUsers(count: number) {
    this.metrics.activeUsersGauge.addCallback((result) => {
      result.observe(count);
    });
  }
}