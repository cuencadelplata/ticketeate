import { metrics, MeterProvider } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import {
  PeriodicExportingMetricReader,
  MeterProvider as SDKMeterProvider,
} from '@opentelemetry/sdk-metrics';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export function initMetrics(serviceName: string) {
  // Default behavior: use Prometheus unless explicitly enabling CloudWatch
  // Priority: explicit ENABLE_PROMETHEUS=true -> Prometheus
  //           else if ENABLE_CLOUDWATCH=true -> use CloudWatch/OTLP
  //           otherwise default to Prometheus for local/development
  const explicitProm = process.env.ENABLE_PROMETHEUS === 'true';
  const explicitCloudWatch = process.env.ENABLE_CLOUDWATCH === 'true';
  const enablePrometheus = explicitProm || (!explicitCloudWatch && process.env.ENABLE_PROMETHEUS !== 'false');

  let metricExporter: any;
  const prometheusPort = Number(process.env.PROMETHEUS_PORT || '9464');

  if (enablePrometheus) {
    // Prometheus exporter will start an HTTP server exposed on prometheusPort
    metricExporter = new PrometheusExporter({ startServer: true, port: prometheusPort }, () => {
      // eslint-disable-next-line no-console
      console.log(`Prometheus scrape endpoint: http://localhost:${prometheusPort}/metrics`);
    });
  } else {
    metricExporter = new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/metrics',
    });
  }

  const meterProvider = new SDKMeterProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }),
  });

  // Register metric reader correctly depending on exporter type.
  // - PrometheusExporter already implements MetricReader and starts an HTTP server,
  //   so add it directly to the MeterProvider.
  // - OTLPMetricExporter should be wrapped with a PeriodicExportingMetricReader.
  if (enablePrometheus && metricExporter instanceof PrometheusExporter) {
    // Prometheus exporter is itself a MetricReader
    meterProvider.addMetricReader(metricExporter);
  } else {
    meterProvider.addMetricReader(
      new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 1000,
      }),
    );
  }

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
