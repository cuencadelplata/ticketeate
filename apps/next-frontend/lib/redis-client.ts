import Redis from 'ioredis';
import { REDIS_CONFIG } from './config';

export interface QueuePosition {
  userId: string;
  position: number;
  timestamp: number;
  eventId: string;
}

export interface QueueStatus {
  position: number;
  totalInQueue: number;
  totalActive: number;
  maxConcurrent: number;
  estimatedWaitTime: number; // en segundos
}

export interface ReservationData {
  userId: string;
  eventId: string;
  timestamp: number;
  expiresAt: number;
}

class RedisClient {
  private client: Redis;

  constructor(url: string) {
    this.client = new Redis(url);
  }

  // Script Lua para unirse a la cola
  async joinQueue(
    eventId: string,
    userId: string,
    maxConcurrent: number,
  ): Promise<{
    success: boolean;
    position?: number;
    canEnter?: boolean;
    reservationId?: string;
    error?: string;
  }> {
    const script = `
      local eventId = ARGV[1]
      local userId = ARGV[2]
      local maxConcurrent = tonumber(ARGV[3])
      local timestamp = tonumber(ARGV[4])
      
      local queueKey = "queue:" .. eventId .. ":waiting"
      local activeKey = "queue:" .. eventId .. ":active"
      local reservationKey = "queue:" .. eventId .. ":reservations:" .. userId
      
      -- Verificar si el usuario ya está activo (con reserva válida)
      local isActive = redis.call('EXISTS', reservationKey)
      
      if isActive == 1 then
        -- Usuario ya está comprando, retornar éxito
        return {1, 0, 1, reservationKey}
      end
      
      -- Verificar si el usuario está en activeKey pero sin reserva (reserva expirada)
      local inActiveKey = redis.call('ZRANK', activeKey, userId)
      if inActiveKey then
        -- Limpiar entrada inválida de activeKey
        redis.call('ZREM', activeKey, userId)
      end
      
      -- Verificar si el usuario ya está en la cola de espera
      local existingPosition = redis.call('ZRANK', queueKey, userId)
      
      -- Verificar si hay espacio disponible
      local activeCount = redis.call('ZCARD', activeKey)
      
      if activeCount < maxConcurrent then
        -- Hay espacio disponible, promover a activo
        
        -- Si ya estaba en la cola de espera, removerlo
        if existingPosition then
          redis.call('ZREM', queueKey, userId)
        end
        
        -- Crear reserva temporal (5 minutos)
        local expiresAt = timestamp + 300
        redis.call('HSET', reservationKey, 'userId', userId, 'eventId', eventId, 'timestamp', timestamp, 'expiresAt', expiresAt)
        redis.call('EXPIRE', reservationKey, 300)
        
        -- Agregar a usuarios activos
        redis.call('ZADD', activeKey, timestamp, userId)
        
        return {1, 0, 1, reservationKey}
      else
        -- No hay espacio, agregar o mantener en la cola
        if existingPosition then
          -- Ya está en la cola, retornar posición actual
          return {1, existingPosition + 1, 0}
        else
          -- Agregar a la cola
          local queueSize = redis.call('ZCARD', queueKey)
          redis.call('ZADD', queueKey, timestamp, userId)
          
          return {1, queueSize + 1, 0}
        end
      end
    `;

    try {
      const result = (await this.client.eval(
        script,
        0,
        eventId,
        userId,
        maxConcurrent.toString(),
        Date.now().toString(),
      )) as [number, number | string, number?, string?];

      if (result[0] === 0) {
        return {
          success: false,
          error: result[1] as string,
        };
      }

      return {
        success: true,
        position: result[1] as number,
        canEnter: result[2] === 1,
        reservationId: result[3],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  // Script Lua para obtener posición en la cola
  async getQueuePosition(eventId: string, userId: string): Promise<QueueStatus | null> {
    const script = `
      local eventId = ARGV[1]
      local userId = ARGV[2]
      
      local queueKey = "queue:" .. eventId .. ":waiting"
      local activeKey = "queue:" .. eventId .. ":active"
      local reservationKey = "queue:" .. eventId .. ":reservations:" .. userId
      
      -- Verificar si está activo
      local isActive = redis.call('EXISTS', reservationKey)
      if isActive == 1 then
        return {0, 0, redis.call('ZCARD', activeKey), 0, 0}
      end
      
      -- Verificar posición en cola
      local position = redis.call('ZRANK', queueKey, userId)
      if not position then
        return nil
      end
      
      local totalInQueue = redis.call('ZCARD', queueKey)
      local totalActive = redis.call('ZCARD', activeKey)
      
      -- Estimar tiempo de espera (promedio 2 minutos por compra)
      local estimatedWaitTime = position * 120
      
      return {position + 1, totalInQueue, totalActive, 0, estimatedWaitTime}
    `;

    try {
      const result = (await this.client.eval(script, 0, eventId, userId)) as number[] | null;

      if (!result) return null;

      return {
        position: result[0],
        totalInQueue: result[1],
        totalActive: result[2],
        maxConcurrent: result[3],
        estimatedWaitTime: result[4],
      };
    } catch (error) {
      console.error('Error getting queue position:', error);
      return null;
    }
  }

  // Script Lua para procesar la cola (mover usuarios de cola a activos)
  async processQueue(
    eventId: string,
    maxConcurrent: number,
  ): Promise<{
    processed: number;
    newActiveUsers: string[];
  }> {
    const script = `
      local eventId = ARGV[1]
      local maxConcurrent = tonumber(ARGV[2])
      local timestamp = tonumber(ARGV[3])
      
      local queueKey = "queue:" .. eventId .. ":waiting"
      local activeKey = "queue:" .. eventId .. ":active"
      
      local activeCount = redis.call('ZCARD', activeKey)
      local availableSlots = maxConcurrent - activeCount
      
      if availableSlots <= 0 then
        return {0, {}}
      end
      
      local processed = 0
      local newActiveUsers = {}
      
      -- Obtener usuarios de la cola ordenados por timestamp
      local queueMembers = redis.call('ZRANGE', queueKey, 0, availableSlots - 1, 'WITHSCORES')
      
      for i = 1, #queueMembers, 2 do
        local userId = queueMembers[i]
        local userTimestamp = tonumber(queueMembers[i + 1])
        
        -- Crear reserva temporal
        local reservationKey = "queue:" .. eventId .. ":reservations:" .. userId
        local expiresAt = timestamp + 300
        redis.call('HSET', reservationKey, 'userId', userId, 'eventId', eventId, 'timestamp', userTimestamp, 'expiresAt', expiresAt)
        redis.call('EXPIRE', reservationKey, 300)
        
        -- Mover a activos
        redis.call('ZADD', activeKey, userTimestamp, userId)
        
        -- Remover de la cola
        redis.call('ZREM', queueKey, userId)
        
        table.insert(newActiveUsers, userId)
        processed = processed + 1
      end
      
      return {processed, newActiveUsers}
    `;

    try {
      const result = (await this.client.eval(
        script,
        0,
        eventId,
        maxConcurrent.toString(),
        Date.now().toString(),
      )) as [number, string[]];

      return {
        processed: result[0],
        newActiveUsers: result[1],
      };
    } catch (error) {
      console.error('Error processing queue:', error);
      return { processed: 0, newActiveUsers: [] };
    }
  }

  // Script Lua para finalizar compra y liberar espacio
  async completePurchase(eventId: string, userId: string): Promise<boolean> {
    const script = `
      local eventId = ARGV[1]
      local userId = ARGV[2]
      
      local activeKey = "queue:" .. eventId .. ":active"
      local reservationKey = "queue:" .. eventId .. ":reservations:" .. userId
      
      -- Verificar que existe la reserva
      local exists = redis.call('EXISTS', reservationKey)
      if exists == 0 then
        return 0
      end
      
      -- Remover de activos
      redis.call('ZREM', activeKey, userId)
      
      -- Eliminar reserva
      redis.call('DEL', reservationKey)
      
      return 1
    `;

    try {
      const result = (await this.client.eval(script, 0, eventId, userId)) as number;
      return result === 1;
    } catch (error) {
      console.error('Error completing purchase:', error);
      return false;
    }
  }

  // Script Lua para abandonar la cola
  async leaveQueue(eventId: string, userId: string): Promise<boolean> {
    const script = `
      local eventId = ARGV[1]
      local userId = ARGV[2]
      
      local queueKey = "queue:" .. eventId .. ":waiting"
      local activeKey = "queue:" .. eventId .. ":active"
      local reservationKey = "queue:" .. eventId .. ":reservations:" .. userId
      
      local removed = 0
      
      -- Remover de la cola
      local queueRemoved = redis.call('ZREM', queueKey, userId)
      if queueRemoved == 1 then
        removed = 1
      end
      
      -- Remover de activos
      local activeRemoved = redis.call('ZREM', activeKey, userId)
      if activeRemoved == 1 then
        removed = 1
      end
      
      -- Eliminar reserva
      local reservationRemoved = redis.call('DEL', reservationKey)
      if reservationRemoved == 1 then
        removed = 1
      end
      
      return removed
    `;

    try {
      const result = (await this.client.eval(script, 0, eventId, userId)) as number;
      return result === 1;
    } catch (error) {
      console.error('Error leaving queue:', error);
      return false;
    }
  }

  // Obtener estadísticas de la cola
  async getQueueStats(eventId: string): Promise<{
    totalInQueue: number;
    totalActive: number;
    queueMembers: string[];
    activeMembers: string[];
  }> {
    try {
      const queueKey = `queue:${eventId}`;
      const activeKey = `active:${eventId}`;

      const [queueMembers, activeMembers] = await Promise.all([
        this.client.zrange(queueKey, 0, -1),
        this.client.zrange(activeKey, 0, -1),
      ]);

      return {
        totalInQueue: queueMembers?.length || 0,
        totalActive: activeMembers?.length || 0,
        queueMembers: queueMembers || [],
        activeMembers: activeMembers || [],
      };
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return {
        totalInQueue: 0,
        totalActive: 0,
        queueMembers: [],
        activeMembers: [],
      };
    }
  }

  // Limpiar reservas expiradas
  async cleanupExpiredReservations(eventId: string): Promise<number> {
    const script = `
      local eventId = ARGV[1]
      local currentTime = tonumber(ARGV[2])
      
      local activeKey = "queue:" .. eventId .. ":active"
      local pattern = "queue:" .. eventId .. ":reservations:*"
      
      local keys = redis.call('KEYS', pattern)
      local cleaned = 0
      
      for i = 1, #keys do
        local key = keys[i]
        local reservation = redis.call('HMGET', key, 'expiresAt')
        
        if reservation[1] and tonumber(reservation[1]) < currentTime then
          local userId = string.match(key, "queue:" .. eventId .. ":reservations:(.+)")
          if userId then
            redis.call('ZREM', activeKey, userId)
            redis.call('DEL', key)
            cleaned = cleaned + 1
          end
        end
      end
      
      return cleaned
    `;

    try {
      const result = (await this.client.eval(script, 0, eventId, Date.now().toString())) as number;
      return result || 0;
    } catch (error) {
      console.error('Error cleaning up expired reservations:', error);
      return 0;
    }
  }
}

// Instancia singleton del cliente Redis
export const redisClient = new RedisClient(REDIS_CONFIG.url);
