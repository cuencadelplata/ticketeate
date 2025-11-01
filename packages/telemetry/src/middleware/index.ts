import { trace } from '@opentelemetry/api';
import { Request, Response, NextFunction } from 'express';
import { SystemMetrics } from '../metrics/system-metrics';

// Inicializar métricas del sistema
const systemMetrics = new SystemMetrics();

export const telemetryMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const tracer = trace.getTracer('express-tracer');
    
    const span = tracer.startSpan(`${req.method} ${req.path}`);
    
    span.setAttributes({
      'http.method': req.method,
      'http.url': req.url,
      'http.route': req.path,
      'http.user_agent': req.get('user-agent') || '',
    });

    // Capturar métricas del sistema al inicio de la petición
    const startMemory = process.memoryUsage();
    const startCpu = process.cpuUsage();

    res.on('finish', () => {
      // Calcular uso de recursos
      const endMemory = process.memoryUsage();
      const endCpu = process.cpuUsage(startCpu);

      span.setAttributes({
        'http.status_code': res.statusCode,
        'system.memory.heap_used': Math.round(endMemory.heapUsed / 1024 / 1024),
        'system.memory.rss': Math.round(endMemory.rss / 1024 / 1024),
        'system.cpu.user': endCpu.user,
        'system.cpu.system': endCpu.system,
      });
      
      span.end();
    });

    next();
  };
};