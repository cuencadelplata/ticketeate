import { Telemetry } from '@ticketeate/telemetry';
import { CloudWatchMetrics } from '@ticketeate/telemetry/aws';

// Inicializar telemetría
const telemetry = Telemetry.init({
  serviceName: 'svc-checkout',
});

// Inicializar métricas de CloudWatch
const cloudWatch = new CloudWatchMetrics({
  region: process.env.AWS_REGION || 'us-east-1',
  namespace: 'Ticketeate/Checkout',
});

// Middleware para monitorear tiempos de respuesta
export const telemetryMiddleware = async (c, next) => {
  const start = Date.now();

  try {
    await next();
  } finally {
    const duration = Date.now() - start;

    // Registrar tiempo de respuesta
    telemetry.recordProcessingTime(duration);
    await cloudWatch.recordProcessingTime(duration);

    // Si es una compra exitosa
    if (c.req.path.includes('/purchase') && c.res.status === 200) {
      const amount = c.req.body?.amount || 0;
      telemetry.recordPurchase(amount);
      await cloudWatch.recordPurchase(amount);
    }
  }
};
