# svc-checkout

Notas rápidas para habilitar la telemetría Prometheus en desarrollo.

Habilitar Prometheus
---------------------
Este servicio puede arrancar un endpoint Prometheus local que expone `/metrics` si se habilita la exportación Prometheus en la librería `@ticketeate/telemetry`.

- Exportador Prometheus (puerto por defecto `9464`) se activa si:
  - `ENABLE_PROMETHEUS=true` en el entorno, o
  - `OTEL_EXPORTER=prometheus`.

Variables útiles
----------------
- `ENABLE_PROMETHEUS` (boolean): `true` para arrancar el servidor Prometheus en el servicio.
- `PROMETHEUS_PORT` (number): puerto donde arrancará el exporter (por defecto `9464`).

Levantar stack de monitoring (local)
-----------------------------------
El repo incluye una configuración de monitoring en `infra/monitoring` con Prometheus y Grafana.

1. Desde la raíz del repo, levanta el stack de monitoring:

```powershell
cd infra/monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

2. Enciende el exporter en el servicio y arranca la app (ejemplo PowerShell):

```powershell
$env:ENABLE_PROMETHEUS = 'true'
cd C:\Projects\ticketeate\apps\svc-checkout
pnpm dev
```

3. Verifica que el endpoint de Prometheus está accesible:

 - `http://localhost:9464/metrics` (por defecto)
 - `http://localhost:9090` para acceder a Prometheus UI
 - `http://localhost:3000` para Grafana (si el docker-compose lo expone)

Ver métricas relevantes
----------------------
Busca métricas como `ticketeate.purchases`, `ticketeate.queue.length` y `ticketeate.processing.time` en Prometheus/Grafana.

Notas
-----
- Si prefieres no instalar Docker, puedes usar los helpers Terraform/Docker incluidos en `packages/telemetry/collector/iam/terraform` para validación de otros artefactos; esto no afecta al stack Prometheus.
- En producción te recomendamos exportar vía OTLP al Collector (ADOT) y enviar a CloudWatch — la configuración y políticas para eso están en `packages/telemetry/collector`.
