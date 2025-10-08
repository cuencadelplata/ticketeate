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
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  private async executeScript(script: string, keys: string[], args: string[]): Promise<any> {
    try {
      const response = await fetch(`${this.url}/eval`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script,
          keys,
          args,
        }),
      });

      if (!response.ok) {
        throw new Error(`Redis script execution failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Redis script execution error:', error);
      throw error;
    }
  }

  private async executeCommand(command: string, args: string[] = []): Promise<any> {
    try {
      const response = await fetch(`${this.url}/${command}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(`Redis command failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Redis command error:', error);
      throw error;
    }
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
      local timestamp = tonumber(ARGGV[4])
      
      local queueKey = "queue:" .. eventId
      local activeKey = "active:" .. eventId
      local reservationKey = "reservation:" .. eventId .. ":" .. userId
      
      -- Verificar si el usuario ya está en la cola o activo
      local existingPosition = redis.call('ZRANK', queueKey, userId)
      local isActive = redis.call('EXISTS', reservationKey)
      
      if existingPosition or isActive then
        return {false, "Usuario ya está en la cola o comprando"}
      end
      
      -- Verificar si hay espacio disponible
      local activeCount = redis.call('ZCARD', activeKey)
      
      if activeCount < maxConcurrent then
        -- Crear reserva temporal (5 minutos)
        local expiresAt = timestamp + 300
        redis.call('HSET', reservationKey, 'userId', userId, 'eventId', eventId, 'timestamp', timestamp, 'expiresAt', expiresAt)
        redis.call('EXPIRE', reservationKey, 300)
        
        -- Agregar a usuarios activos
        redis.call('ZADD', activeKey, timestamp, userId)
        
        return {true, 0, true, reservationKey}
      else
        -- Agregar a la cola
        local queueSize = redis.call('ZCARD', queueKey)
        redis.call('ZADD', queueKey, timestamp, userId)
        
        return {true, queueSize + 1, false}
      end
    `;

    try {
      const result = await this.executeScript(
        script,
        [],
        [eventId, userId, maxConcurrent.toString(), Date.now().toString()],
      );

      return {
        success: result[0],
        position: result[1],
        canEnter: result[2],
        reservationId: result[3],
        error: result[1] === false ? result[1] : undefined,
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
      
      local queueKey = "queue:" .. eventId
      local activeKey = "active:" .. eventId
      local reservationKey = "reservation:" .. eventId .. ":" .. userId
      
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
      const result = await this.executeScript(script, [], [eventId, userId]);

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
      
      local queueKey = "queue:" .. eventId
      local activeKey = "active:" .. eventId
      
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
        local reservationKey = "reservation:" .. eventId .. ":" .. userId
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
      const result = await this.executeScript(
        script,
        [],
        [eventId, maxConcurrent.toString(), Date.now().toString()],
      );

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
      
      local activeKey = "active:" .. eventId
      local reservationKey = "reservation:" .. eventId .. ":" .. userId
      
      -- Verificar que existe la reserva
      local exists = redis.call('EXISTS', reservationKey)
      if exists == 0 then
        return false
      end
      
      -- Remover de activos
      redis.call('ZREM', activeKey, userId)
      
      -- Eliminar reserva
      redis.call('DEL', reservationKey)
      
      return true
    `;

    try {
      const result = await this.executeScript(script, [], [eventId, userId]);
      return result === true;
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
      
      local queueKey = "queue:" .. eventId
      local activeKey = "active:" .. eventId
      local reservationKey = "reservation:" .. eventId .. ":" .. userId
      
      local removed = false
      
      -- Remover de la cola
      local queueRemoved = redis.call('ZREM', queueKey, userId)
      if queueRemoved == 1 then
        removed = true
      end
      
      -- Remover de activos
      local activeRemoved = redis.call('ZREM', activeKey, userId)
      if activeRemoved == 1 then
        removed = true
      end
      
      -- Eliminar reserva
      local reservationRemoved = redis.call('DEL', reservationKey)
      if reservationRemoved == 1 then
        removed = true
      end
      
      return removed
    `;

    try {
      const result = await this.executeScript(script, [], [eventId, userId]);
      return result === true;
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
        this.executeCommand('ZRANGE', [queueKey, '0', '-1']),
        this.executeCommand('ZRANGE', [activeKey, '0', '-1']),
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
      
      local activeKey = "active:" .. eventId
      local pattern = "reservation:" .. eventId .. ":*"
      
      local keys = redis.call('KEYS', pattern)
      local cleaned = 0
      
      for i = 1, #keys do
        local key = keys[i]
        local reservation = redis.call('HMGET', key, 'expiresAt')
        
        if reservation[1] and tonumber(reservation[1]) < currentTime then
          local userId = string.match(key, "reservation:" .. eventId .. ":(.+)")
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
      const result = await this.executeScript(script, [], [eventId, Date.now().toString()]);
      return result || 0;
    } catch (error) {
      console.error('Error cleaning up expired reservations:', error);
      return 0;
    }
  }
}

// Instancia singleton del cliente Redis
export const redisClient = new RedisClient(REDIS_CONFIG.url!, REDIS_CONFIG.token!);
