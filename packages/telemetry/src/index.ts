import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Module-level singletons
let initialized = false;
let meter: ReturnType<MeterProvider['getMeter']> | null = null;

// Counters / instruments
let purchaseConfirmedCounter: any = null;
let purchaseCancelledCounter: any = null;
let purchaseErrorCounter: any = null;

/**
 * Inicializa métricas OTLP (idempotente).
 * - Usa `OTEL_EXPORTER_OTLP_ENDPOINT` env var para exportar.
 * - Registra gauges observables para memoria y tiempo CPU en proceso.
 */
export function initOtelMetrics(serviceName = 'unknown-service') {
  if (initialized) return;

  const exporterEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  });

  const meterProvider = new MeterProvider({ resource });

  if (exporterEndpoint) {
    const metricExporter = new OTLPMetricExporter({ url: exporterEndpoint });
    const metricReader = new PeriodicExportingMetricReader({ exporter: metricExporter });
    meterProvider.addMetricReader(metricReader);
  }

  meter = meterProvider.getMeter(serviceName);

  // Create counters
  purchaseConfirmedCounter = meter.createCounter('ticket_purchase_confirmed', {
    description: 'Number of confirmed ticket purchases',
  });

  purchaseCancelledCounter = meter.createCounter('ticket_purchase_cancelled', {
    description: 'Number of cancelled ticket purchases',
  });

  purchaseErrorCounter = meter.createCounter('ticket_purchase_error', {
    description: 'Number of errors during purchase flow',
  });

  // Observable gauges for process memory and CPU time
  try {
    meter.createObservableGauge('process_memory_rss_bytes', {
      description: 'Resident Set Size memory of the Node process in bytes',
    }).addCallback((observableResult: any) => {
      try {
        const mem = process.memoryUsage().rss;
        observableResult.observe(mem, {});
      } catch (e) {
        if (typeof console !== 'undefined' && console.debug) {
          console.debug('OTEL metrics: process_memory_rss_bytes observable callback error:', e);
        }
      }
    });

    meter.createObservableGauge('process_cpu_seconds_total', {
      description: 'Total CPU time (user + system) used by the process in seconds',
    }).addCallback((observableResult: any) => {
      try {
        const cpu = process.cpuUsage();
        const seconds = (cpu.user + cpu.system) / 1_000_000; // microsec -> sec
        observableResult.observe(seconds, {});
      } catch (e) {
        if (typeof console !== 'undefined' && console.debug) {
          console.debug('OTEL metrics: process_cpu_seconds_total observable callback error:', e);
        }
      }
    });
  } catch (e) {
    // Some environments may not support observable instruments; log and continue
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('OTEL metrics: failed to register observable gauges:', e);
    }
  }

  initialized = true;
}

/** Helpers para registrar eventos de compra */
export function recordPurchaseConfirmed(attrs?: Record<string, any>) {
  if (!purchaseConfirmedCounter) return;
  purchaseConfirmedCounter.add(1, attrs || {});
}

export function recordPurchaseCancelled(attrs?: Record<string, any>) {
  if (!purchaseCancelledCounter) return;
  purchaseCancelledCounter.add(1, attrs || {});
}

export function recordPurchaseError(attrs?: Record<string, any>) {
  if (!purchaseErrorCounter) return;
  purchaseErrorCounter.add(1, attrs || {});
}

export function getMeter() {
  return meter;
}

export default {
  initOtelMetrics,
  recordPurchaseConfirmed,
  recordPurchaseCancelled,
  recordPurchaseError,
  getMeter,
};
