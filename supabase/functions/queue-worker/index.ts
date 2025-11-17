import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createRedisClient, type Redis } from '../_shared/redis.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROCESS_QUEUE_SCRIPT = `
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

  local queueMembers = redis.call('ZRANGE', queueKey, 0, availableSlots - 1, 'WITHSCORES')

  for i = 1, #queueMembers, 2 do
    local userId = queueMembers[i]
    local userTimestamp = tonumber(queueMembers[i + 1])

    local reservationKey = "reservation:" .. eventId .. ":" .. userId
    local expiresAt = timestamp + 300
    redis.call('HSET', reservationKey, 'userId', userId, 'eventId', eventId, 'timestamp', userTimestamp, 'expiresAt', expiresAt)
    redis.call('EXPIRE', reservationKey, 300)

    redis.call('ZADD', activeKey, userTimestamp, userId)
    redis.call('ZREM', queueKey, userId)

    table.insert(newActiveUsers, userId)
    processed = processed + 1
  end

  return {processed, newActiveUsers}
`;

const CLEANUP_RESERVATIONS_SCRIPT = `
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

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

async function processQueue(
  redis: Redis,
  eventId: string,
  maxConcurrent: number,
): Promise<{ processed: number; newActiveUsers: string[] }> {
  try {
    const result = await redis.eval(
      PROCESS_QUEUE_SCRIPT,
      [],
      [eventId, maxConcurrent.toString(), Date.now().toString()],
    );

    if (!Array.isArray(result) || result.length < 2) {
      return { processed: 0, newActiveUsers: [] };
    }

    const processed = parseNumber(result[0]);
    const newActiveUsers = parseStringArray(result[1]);

    return { processed, newActiveUsers };
  } catch (error) {
    console.error('Error processing queue:', error);
    return { processed: 0, newActiveUsers: [] };
  }
}

async function cleanupExpiredReservations(redis: Redis, eventId: string): Promise<number> {
  try {
    const result = await redis.eval(
      CLEANUP_RESERVATIONS_SCRIPT,
      [],
      [eventId, Date.now().toString()],
    );
    return parseNumber(result);
  } catch (error) {
    console.error('Error cleaning up expired reservations:', error);
    return 0;
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

    const redis = await createRedisClient();

    try {
      const startTime = Date.now();
      console.log('🚀 Iniciando worker de colas en Supabase...');

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

            const cleaned = await cleanupExpiredReservations(redis, queue.eventoid);
            totalCleaned += cleaned;

            const result = await processQueue(redis, queue.eventoid, queue.max_concurrentes);

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
    } finally {
      await redis.quit();
    }
  } catch (error) {
    console.error('❌ Error en worker principal:', error);
    const isConfigError =
      error instanceof Error && error.message.includes('Redis connection environment variables');

    return new Response(
      JSON.stringify({
        error: isConfigError ? 'Redis not configured' : 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
