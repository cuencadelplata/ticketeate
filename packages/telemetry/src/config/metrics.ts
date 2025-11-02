import { metrics, MeterProvider } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  PeriodicExportingMetricReader,
  MeterProvider as SDKMeterProvider,
} from '@opentelemetry/sdk-metrics';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export function initMetrics(serviceName: string) {
  const metricExporter = new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
  });

  const meterProvider = new SDKMeterProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }),
  });

  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 1000,
    }),
  );

  metrics.setGlobalMeterProvider(meterProvider);

  const meter = metrics.getMeter('ticketeate-meter');

  // Métricas personalizadas
  const purchaseCounter = meter.createCounter('ticketeate.purchases', {
    description: 'Número de compras realizadas',
  });

  const queueLengthHistogram = meter.createHistogram('ticketeate.queue.length', {
    description: 'Longitud de la cola de espera',
  });

  const processingTimeHistogram = meter.createHistogram('ticketeate.processing.time', {
    description: 'Tiempo de procesamiento de compras',
  });

  const activeUsersGauge = meter.createObservableGauge('ticketeate.active.users', {
    description: 'Usuarios activos en el sistema',
  });

  return {
    purchaseCounter,
    queueLengthHistogram,
    processingTimeHistogram,
    activeUsersGauge,
  };
}
