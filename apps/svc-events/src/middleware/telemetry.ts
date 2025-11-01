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
  
  try {
    await next();
  } finally {
    const duration = Date.now() - start;
    
    // Registrar tiempo de respuesta
    telemetry.recordProcessingTime(duration);
    await cloudWatch.recordProcessingTime(duration);
    
    // Si la ruta es para verificar la cola
    if (c.req.path.includes('/queue/status')) {
      const queueLength = c.res.body?.queueLength || 0;
      telemetry.recordQueueLength(queueLength);
      await cloudWatch.recordQueueLength(queueLength);
    }
    
    // Monitorear usuarios activos
    if (c.req.path.includes('/events') && c.res.status === 200) {
      const activeUsers = await getActiveUsers(); // Implementar esta función según tu lógica
      telemetry.updateActiveUsers(activeUsers);
      await cloudWatch.recordActiveUsers(activeUsers);
    }
  }
};