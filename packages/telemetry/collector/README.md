ADOT Collector (AWS Distro for OpenTelemetry) - configuración y ejemplos

Archivos incluidos:
- `collector-config.yaml` : Config mínima para recibir OTLP/HTTP y exportar a CloudWatch vía `awsemf`.
- `collector-config-debug.yaml` : Config para pruebas locales usando `logging` exporter (muestra métricas/trazas en stdout).
- `helm-values.yaml` : Valores de ejemplo para desplegar con Helm en EKS.

1) Ejecutar localmente con Docker (debug)

Usa el `collector-config-debug.yaml` para ver las métricas/trazas en stdout sin necesitar credenciales AWS:

Ejemplo (PowerShell):
```powershell
docker run --rm -p 4318:4318 -v C:\Projects\ticketeate\packages\telemetry\collector\collector-config-debug.yaml:/conf/collector-config.yaml \
  public.ecr.aws/aws-observability/aws-otel-collector:latest \
  --config /conf/collector-config.yaml
```

Luego en tu servicio (dev) configura la variable de entorno:

```powershell
$env:OTEL_EXPORTER_OTLP_ENDPOINT = 'http://localhost:4318/v1/metrics'
$env:SERVICE_NAME = 'svc-checkout-dev'
pnpm --filter @ticketeate/svc-checkout dev
```

2) Ejecutar con CloudWatch (requiere credenciales / IAM role)

Si quieres enviar a CloudWatch usa `collector-config.yaml`. Para que `awsemf` pueda enviar métricas necesitas que el proceso del collector tenga permisos AWS adecuados.

- En EKS: crear un ServiceAccount con IRSA apuntando a un IAM Role que tenga permisos `cloudwatch:PutMetricData`, `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents`.
- En ECS/EC2: asigna un Task Role o Instance Role con la política correspondiente.

Ejemplo Docker (PowerShell) con variables de entorno AWS:

```powershell
$env:AWS_ACCESS_KEY_ID = 'AKIA...'
$env:AWS_SECRET_ACCESS_KEY = '...'
$env:AWS_REGION = 'us-east-1'
docker run --rm -p 4318:4318 -v C:\Projects\ticketeate\packages\telemetry\collector\collector-config.yaml:/conf/collector-config.yaml \
  -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_REGION \
  public.ecr.aws/aws-observability/aws-otel-collector:latest \
  --config /conf/collector-config.yaml
```

3) Desplegar en EKS (Helm)

Instalar el chart oficial de ADOT y aplicar `helm-values.yaml` como base:

```bash
helm repo add aws-observability https://aws.github.io/otel-helm-charts
helm repo update
helm install adot-collector aws-observability/aws-otel-collector -f packages/telemetry/collector/helm-values.yaml
```

Notas importantes
- Asegúrate de crear el IAM Role con la política mínima antes de desplegar. Para EKS usa IRSA para no tener credenciales estáticas.
- Si prefieres no dar permisos a las funciones Edge/Deno, usa el patrón proxy: las funciones envían eventos a `svc-checkout` y éste se encarga de reportar a OTLP.
- Revisa logs del collector para verificar que los exportadores (awsemf) reportan correctamente.
