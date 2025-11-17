declare module 'opossum' {
  export interface CircuitBreakerOptions {
    errorThresholdPercentage?: number;
    resetTimeout?: number;
    timeout?: number;
    rollingCountTimeout?: number;
    rollingCountBuckets?: number;
    name?: string;
    fallback?: (...args: any[]) => any;
    [key: string]: any;
  }

  export interface CircuitBreakerStats {
    fires: number;
    failures: number;
    successes: number;
    timeouts: number;
    fallbacks: number;
    rejects?: number;
    cacheHits?: number;
    cacheMisses?: number;
    semaphoreRejections?: number;
    latency: number;
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    [key: string]: any;
  }

  export interface CircuitBreakerStatus {
    window?: string;
    [key: string]: any;
  }

  export default class CircuitBreaker<T extends any[] = any[], R = any> {
    constructor(action: (...args: T) => Promise<R> | R, options?: CircuitBreakerOptions);
    
    name?: string;
    enabled?: boolean;
    status?: CircuitBreakerStatus;
    stats?: CircuitBreakerStats;
    
    fire(...args: T): Promise<R>;
    
    fallback(...args: T): Promise<R>;
    
    stats(): CircuitBreakerStats;
    
    open(): void;
    
    close(): void;
    
    halfOpen(): void;
    
    on(event: string, callback: (...args: any[]) => void): void;
    
    once(event: string, callback: (...args: any[]) => void): void;
    
    removeListener(event: string, callback: (...args: any[]) => void): void;
    
    removeAllListeners(event?: string): void;
  }
}
