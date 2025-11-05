declare module '@opentelemetry/exporter-prometheus' {
  // Minimal shim to satisfy TypeScript until proper types are available
  export interface PrometheusOptions {
    startServer?: boolean;
    port?: number;
    endpoint?: string;
  }

  export class PrometheusExporter {
    constructor(options?: PrometheusOptions, callback?: () => void);
  }

  export default PrometheusExporter;
}
