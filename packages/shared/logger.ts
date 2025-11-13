/**
 * Sistema de logging estructurado para la aplicación
 * Reemplaza console.log/error con un sistema más robusto
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Formatea el mensaje de log con timestamp y nivel
   */
  private formatMessage(level: LogLevel, message: string, data?: LogData): string {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase().padEnd(5);
    
    let output = `[${timestamp}] ${levelUpper} ${message}`;
    
    if (data && Object.keys(data).length > 0) {
      output += '\n' + JSON.stringify(data, null, this.isDevelopment ? 2 : 0);
    }
    
    return output;
  }

  /**
   * Obtiene el color para el nivel de log (solo en desarrollo)
   */
  private getColorForLevel(level: LogLevel): string {
    if (!this.isDevelopment) return '';
    
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m', // Red
    };
    
    return colors[level] || '';
  }

  private resetColor(): string {
    return this.isDevelopment ? '\x1b[0m' : '';
  }

  /**
   * Log nivel debug - solo en desarrollo
   */
  debug(message: string, data?: LogData): void {
    if (!this.isDevelopment) return;
    
    const color = this.getColorForLevel('debug');
    const formatted = this.formatMessage('debug', message, data);
    console.log(color + formatted + this.resetColor());
  }

  /**
   * Log nivel info - información general
   */
  info(message: string, data?: LogData): void {
    const color = this.getColorForLevel('info');
    const formatted = this.formatMessage('info', message, data);
    console.log(color + formatted + this.resetColor());
  }

  /**
   * Log nivel warn - advertencias
   */
  warn(message: string, data?: LogData): void {
    const color = this.getColorForLevel('warn');
    const formatted = this.formatMessage('warn', message, data);
    console.warn(color + formatted + this.resetColor());
  }

  /**
   * Log nivel error - errores
   */
  error(message: string, error?: Error | unknown, data?: LogData): void {
    const color = this.getColorForLevel('error');
    
    const errorData: LogData = { ...data };
    
    if (error instanceof Error) {
      errorData.error = error.message;
      errorData.stack = error.stack;
      
      // En desarrollo, mostrar stack completo
      if (this.isDevelopment && error.stack) {
        errorData.stack = error.stack;
      }
    } else if (error) {
      errorData.error = String(error);
    }
    
    const formatted = this.formatMessage('error', message, errorData);
    console.error(color + formatted + this.resetColor());
  }

  /**
   * Log de peticiones HTTP
   */
  http(method: string, path: string, statusCode: number, duration?: number): void {
    const data: LogData = {
      method,
      path,
      statusCode,
    };
    
    if (duration !== undefined) {
      data.duration = `${duration}ms`;
    }
    
    const level: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const color = this.getColorForLevel(level);
    const formatted = this.formatMessage(level, `HTTP ${method} ${path}`, data);
    console.log(color + formatted + this.resetColor());
  }
}

/**
 * Instancia global del logger
 * Usar en lugar de console.log/error en toda la aplicación
 * 
 * @example
 * import { logger } from '@repo/shared/logger';
 * 
 * logger.info('Usuario creado', { userId: 123 });
 * logger.error('Error al procesar pago', error, { orderId: 456 });
 */
export const logger = new Logger();

/**
 * Tipo para exportar si se necesita crear loggers customizados
 */
export type { LogLevel, LogData };
