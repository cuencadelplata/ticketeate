import { trace } from '@opentelemetry/api';
import { Request, Response, NextFunction } from 'express';

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

    res.on('finish', () => {
      span.setAttributes({
        'http.status_code': res.statusCode,
      });
      span.end();
    });

    next();
  };
};