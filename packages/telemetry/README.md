# @ticketeate/telemetry

Paquete interno para inicializar métricas OpenTelemetry (OTLP) y helpers para métricas de compra (confirmada, cancelada, error) y métricas de proceso (memoria y CPU).

Cómo funciona
- Llama `initOtelMetrics(serviceName)` al iniciar cada servicio Node.js (idempotente).
- Usa la variable de entorno `OTEL_EXPORTER_OTLP_ENDPOINT` para enviar métricas vía OTLP/HTTP (p. ej. AWS Distro for OpenTelemetry Collector o AWS CloudWatch OTEL Collector).
- Provee helpers: `recordPurchaseConfirmed`, `recordPurchaseCancelled`, `recordPurchaseError`.

Ejemplo de uso (Node service)
```ts
import { initOtelMetrics, recordPurchaseConfirmed, recordPurchaseError } from '@ticketeate/telemetry';

initOtelMetrics(process.env.SERVICE_NAME || 'svc-my-service');

// En el flujo donde confirmas una compra
recordPurchaseConfirmed({ eventId: '123', userId: 'u-1' });

// En el catch donde ocurre un error en la compra
recordPurchaseError({ eventId: '123', userId: 'u-1', reason: 'insufficient_stock' });
```

Notas para funciones Deno / Supabase Edge
- Este paquete es para Node (Esm). Para las funciones Deno puedes:
  - Enviar métricas directamente a CloudWatch via SDK PutMetricData.
  - O usar un collector OTEL/OTLP y hacer POST al endpoint OTLP HTTP desde Deno.

Pruebas locales
- Exporta `OTEL_EXPORTER_OTLP_ENDPOINT` apuntando a un collector local (por ejemplo `http://localhost:4318/v1/metrics`) y arranca el servicio.

Uso desde Deno / Supabase Edge
- Para funciones Deno (Supabase) recomendamos enviar un evento simple al backend Node (`svc-checkout`) que actúe como proxy de telemetría. Esto evita exponer el collector directamente y no requiere credenciales AWS en la función.

Ejemplo Deno (Supabase) - POST a `svc-checkout`:
```ts
// En una Supabase Edge Function (Deno)
const TELEMETRY_INGEST_URL = Deno.env.get('SVCCHECKOUT_TELEMETRY_URL') || 'https://svc-checkout.example.com/api/telemetry/ingest';
const TELEMETRY_SECRET = Deno.env.get('TELEMETRY_INGEST_SECRET') || '';

async function sendTelemetryEvent(type: string, eventId?: string, userId?: string, attrs?: Record<string, any>) {
  const body = { type, eventId, userId, attrs };
  const res = await fetch(TELEMETRY_INGEST_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(TELEMETRY_SECRET ? { 'x-telemetry-secret': TELEMETRY_SECRET } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error('Telemetry POST failed', await res.text());
  }
}

// Ejemplo de uso cuando finalizas la compra
await sendTelemetryEvent('purchase_confirmed', 'event-123', 'user-1', { payment_gateway: 'mercadopago' });
```

Notas:
- Configura `TELEMETRY_INGEST_SECRET` como variable de entorno en Supabase y `SVCCHECKOUT_TELEMETRY_URL` con la URL pública o interna de tu `svc-checkout`.
- El endpoint `/api/telemetry/ingest` valida `x-telemetry-secret` si `TELEMETRY_INGEST_SECRET` está presente en `svc-checkout`.
