/**
 * Circuit Breaker Implementation using Opossum
 *
 * Proporciona protección contra fallos en cascada cuando los servicios externos
 * están experimentando problemas.
 */

import CircuitBreaker from 'opossum';

// Re-exportar el tipo para uso en otros módulos
export type CircuitBreakerInstance<T extends any[], R> = CircuitBreaker<T, R>;

export interface CircuitBreakerOptions {
  /**
   * Número de fallos antes de abrir el circuito
   * @default 5
   */
  errorThresholdPercentage?: number;

  /**
   * Tiempo en ms antes de intentar cerrar el circuito
   * @default 10000
   */
  resetTimeout?: number;

  /**
   * Tiempo máximo en ms para considerar una llamada como timeout
   * @default 30000
   */
  timeout?: number;

  /**
   * Número mínimo de requests antes de calcular porcentaje de errores
   * @default 10
   */
  rollingCountTimeout?: number;

  /**
   * Intervalo para calcular estadísticas
   * @default 10000
   */
  rollingCountBuckets?: number;

  /**
   * Nombre del circuito para logging
   */
  name?: string;
}

/**
 * Opciones por defecto para circuit breakers
 */
const DEFAULT_OPTIONS: Required<Omit<CircuitBreakerOptions, 'name'>> & { name?: string } = {
  errorThresholdPercentage: 50, // Abrir circuito cuando 50% de requests fallan
  resetTimeout: 10000, // 10 segundos antes de intentar cerrar
  timeout: 30000, // 30 segundos timeout por request
  rollingCountTimeout: 60000, // Ventana de 60 segundos
  rollingCountBuckets: 10, // 10 buckets para calcular estadísticas
  name: 'default',
};

/**
 * Crear un circuit breaker para una función
 */
export function createCircuitBreaker<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: CircuitBreakerOptions = {},
): CircuitBreaker<T, R> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const breaker = new CircuitBreaker(fn, {
    errorThresholdPercentage: config.errorThresholdPercentage,
    resetTimeout: config.resetTimeout,
    timeout: config.timeout,
    rollingCountTimeout: config.rollingCountTimeout,
    rollingCountBuckets: config.rollingCountBuckets,
    name: config.name,
  });

  // Event listeners para logging y monitoreo
  breaker.on('open', () => {
    console.warn(`[CircuitBreaker:${config.name}] Circuit opened - too many failures`);
  });

  breaker.on('halfOpen', () => {
    console.log(`[CircuitBreaker:${config.name}] Circuit half-open - testing recovery`);
  });

  breaker.on('close', () => {
    console.log(`[CircuitBreaker:${config.name}] Circuit closed - service recovered`);
  });

  breaker.on('timeout', () => {
    console.warn(`[CircuitBreaker:${config.name}] Request timeout`);
  });

  breaker.on('failure', (error: Error) => {
    console.error(`[CircuitBreaker:${config.name}] Request failed:`, error.message);
  });

  breaker.on('success', () => {
    // Solo log en debug mode para no saturar logs
    if (process.env.DEBUG === 'true') {
      console.debug(`[CircuitBreaker:${config.name}] Request succeeded`);
    }
  });

  return breaker;
}

/**
 * Circuit breakers pre-configurados por tipo de servicio
 */

// Circuit breaker para llamadas HTTP genéricas
export function createHttpCircuitBreaker<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  serviceName: string,
): CircuitBreaker<T, R> {
  return createCircuitBreaker(fn, {
    name: `http:${serviceName}`,
    errorThresholdPercentage: 50,
    resetTimeout: 15000, // 15 segundos para servicios HTTP
    timeout: 30000,
  });
}

// Circuit breaker para llamadas entre servicios internos
export function createServiceCircuitBreaker<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  serviceName: string,
): CircuitBreaker<T, R> {
  return createCircuitBreaker(fn, {
    name: `service:${serviceName}`,
    errorThresholdPercentage: 40, // Más estricto para servicios internos
    resetTimeout: 10000, // 10 segundos
    timeout: 20000, // Timeout más corto para servicios internos
  });
}

// Circuit breaker para operaciones críticas (ej: envío de emails)
export function createCriticalCircuitBreaker<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string,
): CircuitBreaker<T, R> {
  return createCircuitBreaker(fn, {
    name: `critical:${operationName}`,
    errorThresholdPercentage: 30, // Muy estricto para operaciones críticas
    resetTimeout: 30000, // 30 segundos antes de reintentar
    timeout: 60000, // 60 segundos timeout para operaciones críticas
  });
}

/**
 * Wrapper para fetch con circuit breaker
 */
export function createFetchCircuitBreaker(serviceName: string) {
  const breaker = createHttpCircuitBreaker(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const response = await fetch(url, options);

      // Considerar errores HTTP 5xx como fallos del servicio
      if (response.status >= 500 && response.status < 600) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    },
    serviceName,
  );

  return breaker;
}

/**
 * Obtener estadísticas de un circuit breaker
 */
export function getCircuitBreakerStats(breaker: CircuitBreakerInstance<any, any>) {
  return {
    name: breaker.name,
    enabled: breaker.enabled,
    state: breaker.status?.window,
    failures: breaker.stats?.failures || 0,
    successes: breaker.stats?.successes || 0,
    timeouts: breaker.stats?.timeouts || 0,
    rejections: breaker.stats?.rejects || 0,
    fires: breaker.stats?.fires || 0,
    cacheHits: breaker.stats?.cacheHits || 0,
    cacheMisses: breaker.stats?.cacheMisses || 0,
    semaphoreRejections: breaker.stats?.semaphoreRejections || 0,
  };
}

