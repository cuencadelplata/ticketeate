/**
 * Queue System Architecture
 *
 * Sistema de colas para control de concurrencia en compra de entradas
 * Utiliza Redis (Upstash) para gestionar estado distribuido
 */

export interface QueueConfig {
  eventId: string;
  maxConcurrentBuyers: number; // Máximo de compradores simultáneos
  queueEnabled: boolean; // Si está habilitada la cola para este evento
  reservationTimeSeconds: number; // Tiempo de reserva temporal (ej: 300s = 5min)
  queueTimeoutSeconds: number; // Tiempo máximo en cola antes de expirar
}

export interface QueuePosition {
  userId: string;
  eventId: string;
  position: number; // Posición en la cola (1 = primero)
  estimatedWaitSeconds: number;
  joinedAt: Date;
  expiresAt: Date;
}

export interface QueueStatus {
  eventId: string;
  queueLength: number;
  activeBuyers: number;
  userPosition?: number;
  canEnter: boolean;
  estimatedWaitTime: number;
}

export interface TicketReservation {
  reservationId: string;
  userId: string;
  eventId: string;
  sectorId: string;
  quantity: number;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Redis Keys Structure:
 *
 * queue:{eventId}:config -> QueueConfig (hash)
 * queue:{eventId}:waiting -> Sorted Set (score = timestamp)
 * queue:{eventId}:active -> Set de userIds activos comprando
 * queue:{eventId}:reservations:{userId} -> TicketReservation (hash)
 * queue:{eventId}:stock:{sectorId} -> Contador de disponibilidad
 */

export const REDIS_KEYS = {
  queueConfig: (eventId: string) => `queue:${eventId}:config`,
  queueWaiting: (eventId: string) => `queue:${eventId}:waiting`,
  queueActive: (eventId: string) => `queue:${eventId}:active`,
  reservation: (eventId: string, userId: string) => `queue:${eventId}:reservations:${userId}`,
  stockCounter: (eventId: string, sectorId: string) => `queue:${eventId}:stock:${sectorId}`,
} as const;
