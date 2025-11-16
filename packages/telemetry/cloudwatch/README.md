Plantillas y comandos para crear Dashboard y Alarms en CloudWatch

1) Crear Dashboard

Usa el archivo `dashboard.json` y el siguiente comando:

```bash
aws cloudwatch put-dashboard --dashboard-name Ticketeate-Telemetry --dashboard-body file://packages/telemetry/cloudwatch/dashboard.json --region us-east-1
```

2) Crear Alarmas (ejemplos con AWS CLI)

# Alarm: ticket_purchase_error (sum > 5 en 5 minutos)
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "Ticketeate-Purchase-Errors-High" \
  --metric-name ticket_purchase_error \
  --namespace Ticketeate \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --evaluation-periods 1 \
  --alarm-actions <SNS_TOPIC_ARN_OR_OTHER_ACTION> \
  --region us-east-1
```

# Alarm: process_memory_rss_bytes (avg > 500MB over 5 minutes)
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "Ticketeate-Process-Memory-High" \
  --metric-name process_memory_rss_bytes \
  --namespace Ticketeate \
  --statistic Average \
  --period 300 \
  --threshold 524288000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions <SNS_TOPIC_ARN_OR_OTHER_ACTION> \
  --region us-east-1
```

# Alarm: process_cpu_seconds_total (rate > threshold)
Nota: `process_cpu_seconds_total` es un contador acumulativo; si quieres alarmar por CPU utiliza una métrica derivada (p. ej. tasa sobre el periodo) o conviértelo a porcentaje en el collector. Como alternativa puedes monitorizar `CPUUtilization` del EC2/ECS.

3) Recomendaciones
- Reemplaza `<SNS_TOPIC_ARN_OR_OTHER_ACTION>` por un ARN válido de SNS, acción de AutoScaling o un Runbook en AWS Systems Manager.
- Ajusta `region` a la región donde despliegas el collector y servicios.
