import type { ContextVariableMap } from 'hono';

// Definir los tipos de variables de contexto para Hono
declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
  }
}
