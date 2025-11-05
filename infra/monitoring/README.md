# Monitoring (Prometheus + Grafana)

Este directorio contiene configuración para levantar un stack local de monitoring con Prometheus y Grafana.

Pasos rápidos (local):

1. Enciende la exportación Prometheus en los servicios que uses (por ejemplo, usando la variable de entorno):

```powershell
$env:ENABLE_PROMETHEUS = 'true'
# o en Linux/macOS: export ENABLE_PROMETHEUS=true
```

2. Levanta Prometheus y Grafana:

```powershell
docker compose -f infra/monitoring/docker-compose.monitoring.yml up -d
```

3. Grafana estará en http://localhost:3000 (user: admin / pass: admin).
   El datasource Prometheus se configura automáticamente y cargará el dashboard `Ticketeate Basic`.

Notas:
- Las aplicaciones que inicialicen `@ticketeate/telemetry` con `ENABLE_PROMETHEUS=true` arrancarán un servidor local en el puerto 9464 por defecto y expondrán `/metrics`.
- Puedes cambiar `PROMETHEUS_PORT` en el env de cada servicio si necesitas otro puerto.
