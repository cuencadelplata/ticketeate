declare module 'opossum' {
  export default class CircuitBreaker {
    constructor(
      action: (...args: any[]) => Promise<any>,
      options?: {
        timeout?: number;
        errorThresholdPercentage?: number;
        resetTimeout?: number;
      }
    );
    
    fire(...args: any[]): Promise<any>;
    open(): void;
    close(): void;
    halfOpen(): void;
    isOpen(): boolean;
    isClosed(): boolean;
  }
}