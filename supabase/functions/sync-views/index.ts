import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

class RedisClient {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  async get(key: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.url}/get/${key}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}/del/${key}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.url}/keys/${pattern}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Redis KEYS error:', error);
      return [];
    }
  }
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const redisUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
    const redisToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

    if (!redisUrl || !redisToken) {
      return new Response(
        JSON.stringify({ error: 'Redis not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const redis = new RedisClient(redisUrl, redisToken);
    
    // Obtener todas las claves de contadores de eventos
    const viewKeys = await redis.keys('event:*:views');
    
    if (viewKeys.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No view counters to sync', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let syncedCount = 0;
    const results = [];

    for (const key of viewKeys) {
      try {
        // Extraer el ID del evento de la clave
        const eventId = key.split(':')[1];
        
        if (!eventId) {
          console.warn(`Invalid view key format: ${key}`);
          continue;
        }

        // Obtener el conteo actual de Redis
        const redisCount = await redis.get(key);
        
        if (!redisCount) continue;

        const count = parseInt(redisCount);
        
        if (isNaN(count) || count <= 0) continue;

        // Actualizar la base de datos usando Supabase
        const { error } = await supabase.rpc('increment_event_views', {
          event_id: eventId,
          increment_by: count
        });

        if (error) {
          console.error(`Error updating views for event ${eventId}:`, error);
          results.push({
            eventId,
            count,
            synced: false,
            error: error.message
          });
          continue;
        }

        // Eliminar el contador de Redis después de sincronizar
        await redis.del(key);
        
        syncedCount += count;
        results.push({
          eventId,
          count,
          synced: true
        });

        console.log(`Synced ${count} views for event ${eventId}`);
        
      } catch (error) {
        console.error(`Error syncing views for key ${key}:`, error);
        results.push({
          eventId: key.split(':')[1],
          count: 0,
          synced: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'View sync completed',
        synced: syncedCount,
        processed: viewKeys.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-views:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
