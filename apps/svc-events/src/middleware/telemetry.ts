import { Telemetry } from '@ticketeate/telemetry';
import { CloudWatchMetrics } from '@ticketeate/telemetry/aws';

// Inicializar telemetría
const telemetry = Telemetry.init({
  serviceName: 'svc-events',
});

// Inicializar métricas de CloudWatch
const cloudWatch = new CloudWatchMetrics({
  region: process.env.AWS_REGION || 'us-east-1',
  namespace: 'Ticketeate/Events',
});

// Middleware para monitorear colas y usuarios activos
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

      // Registrar métricas del sistema
      try {
        await cloudWatch.recordCpuUsage(cpuPercent);
      } catch (err) {
        console.error('CloudWatch recordCpuUsage error', err);
      }
      try {
        await cloudWatch.recordMemoryUsage(Math.round(endMemory.heapUsed / 1024 / 1024));
      } catch (err) {
        console.error('CloudWatch recordMemoryUsage error', err);
      }
    }

    // Si la ruta es para verificar la cola
    if (c.req.path.includes('/queue/status')) {
      const queueLength = c.res.body?.queueLength || 0;
      telemetry.recordQueueLength(queueLength);
      await cloudWatch.recordQueueLength(queueLength);
    }

    // Monitorear usuarios activos
    if (c.req.path.includes('/events') && c.res.status === 200) {
      // Placeholder: intenta leer del response o usar lógica de servicio
      const activeUsers = c.res.body?.activeUsers || 0;
      telemetry.updateActiveUsers(activeUsers);
      if (process.env.ENABLE_CLOUDWATCH === 'true') {
        try {
          await cloudWatch.recordActiveUsers(activeUsers);
        } catch (err) {
          console.error('CloudWatch recordActiveUsers error', err);
        }
      }
    }
  }
};
