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
  async getQueuePosition(
    eventId: string,
    userId: string,
  ): Promise<{
    position: number;
    totalInQueue: number;
    totalActive: number;
    maxConcurrent: number;
    estimatedWaitTime: number;
  } | null> {
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

  // Script Lua para finalizar compra
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

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'join'; // join, position, leave

    // Obtener configuración de cola
    const getQueueConfig = async (eventId: string) => {
      const { data, error } = await supabase
        .from('colas_evento')
        .select('*')
        .eq('eventoid', eventId)
        .single();

      if (error) throw new Error('No hay configuración de cola para este evento');
      return data;
    };

    // POST - Todas las operaciones de cola
    if (req.method === 'POST') {
      const { eventId, userId } = await req.json();

      if (!eventId || !userId) {
        return new Response(JSON.stringify({ error: 'eventId y userId son requeridos' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      switch (action) {
        case 'join': {
          const queueConfig = await getQueueConfig(eventId);
          const result = await redis.joinQueue(eventId, userId, queueConfig.max_concurrentes);

          if (!result.success) {
            return new Response(
              JSON.stringify({ error: result.error || 'Error al unirse a la cola' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
            );
          }

          // Crear registro en BD
          if (result.canEnter && result.reservationId) {
            await supabase.from('cola_turnos').insert({
              turnoid: result.reservationId,
              colaid: queueConfig.colaid,
              usuarioid: userId,
              estado: 'en_compra',
              posicion: 0,
              fecha_atencion: new Date().toISOString(),
            });
          } else if (result.position !== undefined) {
            await supabase.from('cola_turnos').insert({
              turnoid: `queue-${Date.now()}-${userId}`,
              colaid: queueConfig.colaid,
              usuarioid: userId,
              estado: 'esperando',
              posicion: result.position,
            });
          }

          // Publicar update via Realtime
          await supabase.channel(`queue:${eventId}`).send({
            type: 'broadcast',
            event: 'queue_update',
            payload: {
              eventId,
              userId,
              action: 'joined',
              canEnter: result.canEnter,
              position: result.position,
              timestamp: Date.now(),
            },
          });

          return new Response(
            JSON.stringify({
              success: true,
              canEnter: result.canEnter,
              position: result.position,
              reservationId: result.reservationId,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
          );
        }

        case 'leave': {
          const success = await redis.leaveQueue(eventId, userId);

          if (success) {
            // Actualizar estado en BD
            await supabase
              .from('cola_turnos')
              .update({ estado: 'abandonado' })
              .eq('usuarioid', userId)
              .eq('colas_evento.eventoid', eventId);

            // Publicar update via Realtime
            await supabase.channel(`queue:${eventId}`).send({
              type: 'broadcast',
              event: 'queue_update',
              payload: {
                eventId,
                userId,
                action: 'left',
                timestamp: Date.now(),
              },
            });
          }

          return new Response(JSON.stringify({ success }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        default:
          return new Response(JSON.stringify({ error: 'Acción no válida. Use: join, leave' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
      }
    }

    // GET - Obtener posición en la cola
    if (req.method === 'GET') {
      const eventId = url.searchParams.get('eventId');
      const userId = url.searchParams.get('userId');

      if (!eventId || !userId) {
        return new Response(JSON.stringify({ error: 'eventId y userId son requeridos' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const queueStatus = await redis.getQueuePosition(eventId, userId);

      if (!queueStatus) {
        return new Response(JSON.stringify({ error: 'Usuario no está en la cola' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      return new Response(JSON.stringify(queueStatus), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Método no soportado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  } catch (error) {
    console.error('Error en queue operations:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
