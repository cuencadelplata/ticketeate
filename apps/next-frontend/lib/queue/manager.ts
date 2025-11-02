import { redisClient } from '../redis-client';
import type { QueueConfig, QueuePosition, QueueStatus, TicketReservation } from './types';
import { REDIS_KEYS } from './types';
import { prisma } from '@repo/db';

// Usar el cliente Redis local configurado
const redis = redisClient['client']; // Acceder al cliente ioredis interno

export class QueueManager {
  /**
   * Obtener configuración de cola para un evento
   * Intenta obtener de Redis primero, si no existe, busca en la base de datos
   */
  static async getQueueConfig(eventId: string): Promise<QueueConfig | null> {
    try {
      // Intentar obtener de Redis primero
      const config = await redis.hgetall(REDIS_KEYS.queueConfig(eventId));

      if (config && Object.keys(config).length > 0) {
        return {
          eventId: config.eventId,
          maxConcurrentBuyers: parseInt(config.maxConcurrentBuyers as string, 10),
          queueEnabled: config.queueEnabled === 'true' || config.queueEnabled === '1',
          reservationTimeSeconds: parseInt(config.reservationTimeSeconds as string, 10),
          queueTimeoutSeconds: parseInt(config.queueTimeoutSeconds as string, 10),
        };
      }

      // Si no está en Redis, buscar en la base de datos
      console.log(
        `[QueueManager] Config not in Redis, fetching from database for event: ${eventId}`,
      );
      const dbConfig = await prisma.colas_evento.findFirst({
        where: { eventoid: eventId },
      });

      if (!dbConfig) {
        console.log(`[QueueManager] No queue config found in database for event: ${eventId}`);
        return null;
      }

      // Crear configuración desde la base de datos y guardarla en Redis
      const queueConfig: QueueConfig = {
        eventId: dbConfig.eventoid,
        maxConcurrentBuyers: dbConfig.max_concurrentes,
        queueEnabled: true,
        reservationTimeSeconds: 300, // 5 minutos por defecto
        queueTimeoutSeconds: 3600, // 1 hora por defecto
      };

      // Guardar en Redis para futuras consultas
      await this.setQueueConfig(queueConfig);
      console.log(`[QueueManager] Queue config synced to Redis:`, queueConfig);

      return queueConfig;
    } catch (error) {
      console.error('Error getting queue config:', error);
      return null;
    }
  }

  /**
   * Configurar cola para un evento
   */
  static async setQueueConfig(config: QueueConfig): Promise<boolean> {
    try {
      await redis.hset(
        REDIS_KEYS.queueConfig(config.eventId),
        'eventId',
        config.eventId,
        'maxConcurrentBuyers',
        config.maxConcurrentBuyers.toString(),
        'queueEnabled',
        config.queueEnabled ? '1' : '0',
        'reservationTimeSeconds',
        config.reservationTimeSeconds.toString(),
        'queueTimeoutSeconds',
        config.queueTimeoutSeconds.toString(),
      );
      return true;
    } catch (error) {
      console.error('Error setting queue config:', error);
      return false;
    }
  }

  /**
   * Unirse a la cola de compra
   */
  static async joinQueue(eventId: string, userId: string): Promise<QueuePosition | null> {
    try {
      const config = await this.getQueueConfig(eventId);

      // Si no hay config o cola deshabilitada, permitir entrada directa
      if (!config || !config.queueEnabled) {
        return {
          userId,
          eventId,
          position: 0,
          estimatedWaitSeconds: 0,
          joinedAt: new Date(),
          expiresAt: new Date(Date.now() + 300000), // 5 minutos
        };
      }

      // Verificar si ya está en cola o activo
      const isActive = await redis.sismember(REDIS_KEYS.queueActive(eventId), userId);
      if (isActive) {
        return this.getQueuePosition(eventId, userId);
      }

      // Agregar a cola de espera
      const timestamp = Date.now();
      await redis.zadd(REDIS_KEYS.queueWaiting(eventId), timestamp, userId);

      // Intentar promover usuarios de la cola
      await this.promoteFromQueue(eventId);

      return await this.getQueuePosition(eventId, userId);
    } catch (error) {
      console.error('Error joining queue:', error);
      return null;
    }
  }

  /**
   * Obtener posición del usuario en la cola
   */
  static async getQueuePosition(eventId: string, userId: string): Promise<QueuePosition | null> {
    try {
      // Verificar si está activo
      const isActive = await redis.sismember(REDIS_KEYS.queueActive(eventId), userId);

      if (isActive) {
        return {
          userId,
          eventId,
          position: 0, // Ya está comprando
          estimatedWaitSeconds: 0,
          joinedAt: new Date(),
          expiresAt: new Date(Date.now() + 300000),
        };
      }

      // Buscar en cola de espera
      const rank = await redis.zrank(REDIS_KEYS.queueWaiting(eventId), userId);

      if (rank === null) {
        return null; // No está en cola
      }

      const config = await this.getQueueConfig(eventId);
      const avgTimePerUser = 120; // 2 minutos promedio por usuario
      const estimatedWait = (rank + 1) * avgTimePerUser;

      return {
        userId,
        eventId,
        position: rank + 1,
        estimatedWaitSeconds: estimatedWait,
        joinedAt: new Date(),
        expiresAt: new Date(Date.now() + (config?.queueTimeoutSeconds || 3600) * 1000),
      };
    } catch (error) {
      console.error('Error getting queue position:', error);
      return null;
    }
  }

  /**
   * Obtener estado general de la cola
   */
  static async getQueueStatus(eventId: string, userId?: string): Promise<QueueStatus> {
    try {
      const config = await this.getQueueConfig(eventId);

      // Si no hay configuración de cola, permitir acceso directo (sin cola)
      if (!config || !config.queueEnabled) {
        console.log(
          `[QueueManager] No queue config or queue disabled for event ${eventId}, allowing direct access`,
        );
        return {
          eventId,
          queueLength: 0,
          activeBuyers: 0,
          userPosition: 0,
          canEnter: true, // Sin cola configurada = acceso directo
          estimatedWaitTime: 0,
        };
      }

      // IMPORTANTE: Limpiar entradas stale en active que no tienen reservación
      // Esto previene que usuarios sin reservación bloqueen el sistema
      await this.cleanupStaleActiveEntries(eventId);

      const queueLength = await redis.zcard(REDIS_KEYS.queueWaiting(eventId));
      const activeBuyers = await redis.zcard(REDIS_KEYS.queueActive(eventId)); // ZCARD para Sorted Sets

      let userPosition: number | undefined;
      let canEnter = false;

      if (userId) {
        // Verificar si tiene una reserva activa (esto es lo que determina si puede comprar)
        const reservationExists = await redis.exists(REDIS_KEYS.reservation(eventId, userId));
        canEnter = reservationExists === 1;

        if (!canEnter) {
          // No está activo, verificar si está en la cola de espera
          const rank = await redis.zrank(REDIS_KEYS.queueWaiting(eventId), userId);
          userPosition = rank !== null ? rank + 1 : undefined;
        } else {
          userPosition = 0;
        }
      }

      return {
        eventId,
        queueLength: queueLength || 0,
        activeBuyers: activeBuyers || 0,
        userPosition,
        canEnter,
        estimatedWaitTime: (userPosition || 0) * 120, // 2 min por persona
      };
    } catch (error) {
      console.error('Error getting queue status:', error);
      return {
        eventId,
        queueLength: 0,
        activeBuyers: 0,
        canEnter: !userId ? false : true, // Si hay error, permitir entrada
        estimatedWaitTime: 0,
      };
    }
  }

  /**
   * Promover usuarios de la cola a activos
   */
  static async promoteFromQueue(eventId: string): Promise<number> {
    try {
      const config = await this.getQueueConfig(eventId);
      if (!config) return 0;

      const activeBuyers = await redis.zcard(REDIS_KEYS.queueActive(eventId)); // ZCARD para Sorted Sets
      const spotsAvailable = config.maxConcurrentBuyers - (activeBuyers || 0);

      if (spotsAvailable <= 0) return 0;

      // Obtener los primeros N usuarios de la cola
      const usersToPromote = await redis.zrange(
        REDIS_KEYS.queueWaiting(eventId),
        0,
        spotsAvailable - 1,
      );

      if (!usersToPromote || usersToPromote.length === 0) return 0;

      // Promover a activos
      for (const userId of usersToPromote) {
        await redis.sadd(REDIS_KEYS.queueActive(eventId), userId);
        await redis.zrem(REDIS_KEYS.queueWaiting(eventId), userId);

        // Establecer TTL para auto-expiración
        await redis.expire(REDIS_KEYS.queueActive(eventId), config.reservationTimeSeconds);
      }

      return usersToPromote.length;
    } catch (error) {
      console.error('Error promoting from queue:', error);
      return 0;
    }
  }

  /**
   * Salir de la cola (completar o cancelar compra)
   */
  static async leaveQueue(eventId: string, userId: string): Promise<boolean> {
    try {
      console.log(`[QueueManager] User ${userId} leaving queue for event ${eventId}`);

      // Remover de activos (ZSET)
      await redis.zrem(REDIS_KEYS.queueActive(eventId), userId);

      // Remover de cola de espera (ZSET)
      await redis.zrem(REDIS_KEYS.queueWaiting(eventId), userId);

      // Eliminar reservación si existe
      await redis.del(REDIS_KEYS.reservation(eventId, userId));

      // Promover siguiente usuario
      await this.promoteFromQueue(eventId);

      console.log(`[QueueManager] User ${userId} successfully left queue`);
      return true;
    } catch (error) {
      console.error('Error leaving queue:', error);
      return false;
    }
  }

  /**
   * Verificar si el usuario puede comprar (está activo)
   */
  static async canUserBuy(eventId: string, userId: string): Promise<boolean> {
    try {
      const config = await this.getQueueConfig(eventId);

      // Si no hay cola configurada o está deshabilitada, permitir
      if (!config || !config.queueEnabled) {
        return true;
      }

      const isActive = await redis.sismember(REDIS_KEYS.queueActive(eventId), userId);
      return isActive === 1;
    } catch (error) {
      console.error('Error checking if user can buy:', error);
      return false;
    }
  }

  /**
   * Limpiar entradas stale en active que no tienen reservación
   */
  static async cleanupStaleActiveEntries(eventId: string): Promise<number> {
    try {
      // Obtener todos los usuarios en active
      const activeUsers = await redis.zrange(REDIS_KEYS.queueActive(eventId), 0, -1);

      if (activeUsers.length === 0) {
        return 0;
      }

      let removedCount = 0;

      // Verificar cada usuario si tiene reservación
      for (const userId of activeUsers) {
        const hasReservation = await redis.exists(REDIS_KEYS.reservation(eventId, userId));

        if (hasReservation === 0) {
          // No tiene reservación, remover de active
          await redis.zrem(REDIS_KEYS.queueActive(eventId), userId);
          removedCount++;
          console.log(`[QueueManager] Removed stale active entry for user: ${userId}`);
        }
      }

      if (removedCount > 0) {
        console.log(
          `[QueueManager] Cleaned ${removedCount} stale active entries for event: ${eventId}`,
        );
      }

      return removedCount;
    } catch (error) {
      console.error('Error cleaning stale active entries:', error);
      return 0;
    }
  }

  /**
   * Limpiar colas expiradas
   */
  static async cleanExpiredQueues(eventId: string): Promise<void> {
    try {
      const config = await this.getQueueConfig(eventId);
      if (!config) return;

      const now = Date.now();
      const expireTime = now - config.queueTimeoutSeconds * 1000;

      // Remover usuarios antiguos de la cola de espera
      await redis.zremrangebyscore(REDIS_KEYS.queueWaiting(eventId), 0, expireTime);
    } catch (error) {
      console.error('Error cleaning expired queues:', error);
    }
  }
}
