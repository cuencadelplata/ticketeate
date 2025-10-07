import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cliente Redis para Upstash
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

  // Script Lua para procesar la cola
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

  // Script Lua para limpiar reservas expiradas
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
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const redis = new RedisClient(
      Deno.env.get('UPSTASH_REDIS_REST_URL') ?? '',
      Deno.env.get('UPSTASH_REDIS_REST_TOKEN') ?? '',
    );

    const startTime = Date.now();
    console.log('🚀 Iniciando worker de colas en Supabase...');

    // Obtener todas las colas activas
    const { data: activeQueues, error: queueError } = await supabase
      .from('colas_evento')
      .select(
        `
        *,
        eventos (
          titulo,
          estado
        )
      `,
      )
      .eq('eventos.estado', 'ACTIVO');

    if (queueError) {
      throw new Error(`Error fetching queues: ${queueError.message}`);
    }

    console.log(`📋 Encontradas ${activeQueues?.length || 0} colas activas`);

    const results = [];
    let totalProcessed = 0;
    let totalCleaned = 0;

    if (activeQueues && activeQueues.length > 0) {
      for (const queue of activeQueues) {
        try {
          console.log(`🔄 Procesando cola para evento: ${queue.eventos.titulo}`);

          // Limpiar reservas expiradas
          const cleaned = await redis.cleanupExpiredReservations(queue.eventoid);
          totalCleaned += cleaned;

          // Procesar la cola
          const result = await redis.processQueue(queue.eventoid, queue.max_concurrentes);

          // Actualizar estados en BD
          if (result.newActiveUsers.length > 0) {
            const { error: updateError } = await supabase
              .from('cola_turnos')
              .update({
                estado: 'en_compra',
                fecha_atencion: new Date().toISOString(),
              })
              .in('usuarioid', result.newActiveUsers)
              .eq('colaid', queue.colaid);

            if (updateError) {
              console.error(`Error updating turnos for ${queue.eventoid}:`, updateError);
            }
          }

          totalProcessed += result.processed;

          results.push({
            eventId: queue.eventoid,
            eventTitle: queue.eventos.titulo,
            processed: result.processed,
            newActiveUsers: result.newActiveUsers.length,
            cleanedExpired: cleaned,
          });

          console.log(
            `✅ Evento ${queue.eventos.titulo}: ${result.processed} procesados, ${cleaned} limpiados`,
          );

          // Publicar update via Realtime
          await supabase.channel(`queue:${queue.eventoid}`).send({
            type: 'broadcast',
            event: 'queue_update',
            payload: {
              eventId: queue.eventoid,
              timestamp: Date.now(),
              processed: result.processed,
              newActiveUsers: result.newActiveUsers.length,
              cleanedExpired: cleaned,
            },
          });
        } catch (error) {
          console.error(`❌ Error procesando cola para evento ${queue.eventoid}:`, error);
          results.push({
            eventId: queue.eventoid,
            eventTitle: queue.eventos.titulo,
            error: error instanceof Error ? error.message : 'Error desconocido',
          });
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`🏁 Worker completado en ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        duration,
        processedQueues: results.length,
        totalProcessed,
        totalCleaned,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('❌ Error en worker principal:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
