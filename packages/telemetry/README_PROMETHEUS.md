# @ticketeate/telemetry — Prometheus usage

Prometheus is the default metrics exporter for local and development environments.

Environment variables
- `ENABLE_PROMETHEUS=true` : Force Prometheus exporter (default when `ENABLE_CLOUDWATCH` is not `true`).
- `PROMETHEUS_PORT` : Port where the Prometheus endpoint will be exposed (default `9464`).
- `ENABLE_CLOUDWATCH=true` : When set, metrics will be exported via OTLP to configured `OTEL_EXPORTER_OTLP_ENDPOINT` and CloudWatch integration can be used. CloudWatch client calls in middlewares are also enabled only when this is set.

Examples (local dev)

PowerShell:
```
$env:ENABLE_PROMETHEUS = 'true'
$env:PROMETHEUS_PORT = '9464'
pnpm dev
```

Then visit `http://localhost:9464/metrics` to see raw metrics, and use the `infra/monitoring` docker-compose to start Prometheus+Grafana and view dashboards.
