import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createRedisClient, type Redis } from '../_shared/redis.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMPLETE_PURCHASE_SCRIPT = `
  local eventId = ARGV[1]
  local userId = ARGV[2]

  local activeKey = "active:" .. eventId
  local reservationKey = "reservation:" .. eventId .. ":" .. userId

  local exists = redis.call('EXISTS', reservationKey)
  if exists == 0 then
    return 0
  end

  redis.call('ZREM', activeKey, userId)
  redis.call('DEL', reservationKey)

  return 1
`;

async function completePurchase(redis: Redis, eventId: string, userId: string): Promise<boolean> {
  try {
    const result = await redis.eval(COMPLETE_PURCHASE_SCRIPT, [], [eventId, userId]);
    if (typeof result === 'number') {
      return result === 1;
    }
    if (typeof result === 'string') {
      return result === '1';
    }
    return false;
  } catch (error) {
    console.error('Error completing purchase:', error);
    return false;
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
      const { eventId, userId, success = true } = await req.json();

      if (!eventId || !userId) {
        return new Response(JSON.stringify({ error: 'eventId y userId son requeridos' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      console.log(`🔄 Finalizando compra para usuario ${userId} en evento ${eventId}`);

      const completed = await completePurchase(redis, eventId, userId);

      if (completed) {
        const { error: updateError } = await supabase
          .from('cola_turnos')
          .update({
            estado: success ? 'completado' : 'abandonado',
          })
          .eq('usuarioid', userId)
          .eq('colas_evento.eventoid', eventId);

        if (updateError) {
          console.error('Error updating turnos:', updateError);
        }

        await supabase.channel(`queue:${eventId}`).send({
          type: 'broadcast',
          event: 'queue_update',
          payload: {
            eventId,
            userId,
            action: success ? 'completed' : 'failed',
            timestamp: Date.now(),
          },
        });

        console.log(`✅ Compra ${success ? 'completada' : 'fallida'} para usuario ${userId}`);
      }

      return new Response(JSON.stringify({ success: completed }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } finally {
      await redis.quit();
    }
  } catch (error) {
    console.error('Error completing purchase:', error);
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
