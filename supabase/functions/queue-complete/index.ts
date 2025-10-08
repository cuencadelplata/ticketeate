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

    const { eventId, userId, success = true } = await req.json();

    if (!eventId || !userId) {
      return new Response(JSON.stringify({ error: 'eventId y userId son requeridos' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`🔄 Finalizando compra para usuario ${userId} en evento ${eventId}`);

    const completed = await redis.completePurchase(eventId, userId);

    if (completed) {
      // Actualizar estado en BD
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

      // Publicar update via Realtime
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
  } catch (error) {
    console.error('Error completing purchase:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
