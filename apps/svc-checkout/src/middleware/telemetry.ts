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
  const startCpu = process.cpuUsage();
  try {
    await next();
  } finally {
    const duration = Date.now() - start;

    // Calcular uso de recursos
    const endCpu = process.cpuUsage(startCpu);
    const endMemory = process.memoryUsage();
    const cpuMicros = endCpu.user + endCpu.system; // microsegundos
    const cpuPercent = Math.round((cpuMicros / (duration * 1000)) * 100);

    // Registrar tiempo de respuesta
    telemetry.recordProcessingTime(duration);
      if (process.env.ENABLE_CLOUDWATCH === 'true') {
        try {
          await cloudWatch.recordProcessingTime(duration);
        } catch (err) {
          console.error('CloudWatch recordProcessingTime error', err);
        }
      }

    // Registrar métricas del sistema
    try {
        if (process.env.ENABLE_CLOUDWATCH === 'true') {
          await cloudWatch.recordCpuUsage(cpuPercent);
        }
    } catch (e) {
        console.error('CloudWatch recordCpuUsage error', e);
    }
    try {
        if (process.env.ENABLE_CLOUDWATCH === 'true') {
          await cloudWatch.recordMemoryUsage(Math.round(endMemory.heapUsed / 1024 / 1024));
        }
    } catch (e) {
        console.error('CloudWatch recordMemoryUsage error', e);
    }

    // Si es una compra exitosa
    if (c.req.path.includes('/purchase') && c.res.status === 200) {
      const amount = c.req.body?.amount || 0;
      telemetry.recordPurchase(amount);
      if (process.env.ENABLE_CLOUDWATCH === 'true') {
        try {
          await cloudWatch.recordPurchase(amount);
        } catch (err) {
          console.error('CloudWatch recordPurchase error', err);
        }
      }
    }
  }
};
