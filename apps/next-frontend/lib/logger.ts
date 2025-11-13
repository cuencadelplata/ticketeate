/**
 * Sistema de logging estructurado
 * Reemplaza console.log/console.error con logging más robusto
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Formatea el mensaje de log con contexto adicional
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase().padEnd(5);

    if (this.isDevelopment) {
      // En desarrollo, formato más legible
      const contextStr = context
        ? `\n  Context: ${JSON.stringify(context, null, 2)}`
        : '';
      return `[${timestamp}] ${levelUpper} ${message}${contextStr}`;
    } else {
      // En producción, formato JSON para procesamiento
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...context,
      });
    }
  }

  /**
   * Log de nivel debug (solo en desarrollo)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Log de nivel info
   */
  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }

  /**
   * Log de nivel warning
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  /**
   * Log de nivel error
   */
  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context));

    // En producción, aquí se podría enviar a un servicio de monitoreo
    // como Sentry, DataDog, etc.
    if (this.isProduction) {
      // TODO: Integrar con servicio de monitoreo
      // Ejemplo: Sentry.captureException(new Error(message), { extra: context });
    }
  }

  /**
   * Log de error con objeto Error
   */
  errorWithException(error: Error, context?: LogContext): void {
    this.error(error.message, {
      ...context,
      stack: error.stack,
      name: error.name,
    });
  }
}

/**
 * Instancia singleton del logger
 * Usar esta instancia en toda la aplicación
 */
export const logger = new Logger();

/**
 * Helper para logs de HTTP requests
 */
export const logRequest = (
  method: string,
  path: string,
  statusCode?: number,
  duration?: number,
) => {
  const context: LogContext = {
    method,
    path,
  };

  if (statusCode !== undefined) {
    context.statusCode = statusCode;
  }

  if (duration !== undefined) {
    context.duration = `${duration}ms`;
  }

  if (statusCode && statusCode >= 400) {
    logger.warn('HTTP Request Failed', context);
  } else {
    logger.info('HTTP Request', context);
  }
};
