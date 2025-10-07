import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

// Función para sincronizar contadores diarios de un evento específico
async function syncDailyViewsForEvent(eventId: string, redis: RedisClient, supabase: any): Promise<{
  synced: number;
  errors: number;
  details: Array<{ date: string; views: number; synced: boolean; error?: string }>;
}> {
  const result = {
    synced: 0,
    errors: 0,
    details: [] as Array<{ date: string; views: number; synced: boolean; error?: string }>,
  };

  try {
    // Obtener todas las claves de contadores diarios para este evento
    const dailyKeys = await redis.keys(`event:${eventId}:views:*`);
    
    for (const key of dailyKeys) {
      // Extraer la fecha de la clave (formato: event:eventId:views:YYYY-MM-DD)
      const dateMatch = key.match(/event:.*:views:(\d{4}-\d{2}-\d{2})$/);
      if (!dateMatch) continue;
      
      const dateStr = dateMatch[1];
      
      try {
        // Obtener el conteo de Redis
        const redisCount = await redis.get(key);
        if (!redisCount) continue;
        
        const viewsCount = parseInt(redisCount);
        if (isNaN(viewsCount) || viewsCount <= 0) continue;
        
        // Insertar o actualizar en la base de datos usando Supabase
        const { error } = await supabase
          .from('evento_views_history')
          .upsert({
            id: `${eventId}_${dateStr}`,
            eventoid: eventId,
            fecha: `${dateStr}T00:00:00.000Z`,
            views_count: viewsCount,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'eventoid,fecha'
          });
        
        if (error) {
          result.errors++;
          result.details.push({
            date: dateStr,
            views: viewsCount,
            synced: false,
            error: error.message,
          });
          console.error(`Error syncing daily views for ${dateStr}:`, error);
        } else {
          result.synced++;
          result.details.push({
            date: dateStr,
            views: viewsCount,
            synced: true,
          });
          console.log(`Synced daily views for event ${eventId} on ${dateStr}: ${viewsCount} views`);
        }
      } catch (error) {
        result.errors++;
        result.details.push({
          date: dateStr,
          views: 0,
          synced: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        console.error(`Error syncing daily views for ${dateStr}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in syncDailyViewsForEvent:', error);
    result.errors++;
  }

  return result;
}

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const redisUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
    const redisToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

    if (!redisUrl || !redisToken) {
      return new Response(JSON.stringify({ error: 'Redis not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const redis = new RedisClient(redisUrl, redisToken);

    // Obtener todas las claves de contadores de eventos
    const viewKeys = await redis.keys('event:*:views');

    if (viewKeys.length === 0) {
      return new Response(JSON.stringify({ message: 'No view counters to sync', synced: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let syncedCount = 0;
    let dailySyncedCount = 0;
    const results = [];
    const dailyResults = [];

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
          increment_by: count,
        });

        if (error) {
          console.error(`Error updating views for event ${eventId}:`, error);
          results.push({
            eventId,
            count,
            synced: false,
            error: error.message,
          });
          continue;
        }

        // Sincronizar contadores diarios antes de eliminar las claves
        const dailySyncResult = await syncDailyViewsForEvent(eventId, redis, supabase);
        dailySyncedCount += dailySyncResult.synced;
        dailyResults.push({
          eventId,
          ...dailySyncResult,
        });

        // Eliminar el contador de Redis después de sincronizar
        await redis.del(key);

        syncedCount += count;
        results.push({
          eventId,
          count,
          synced: true,
        });

        console.log(`Synced ${count} views for event ${eventId}`);
      } catch (error) {
        console.error(`Error syncing views for key ${key}:`, error);
        results.push({
          eventId: key.split(':')[1],
          count: 0,
          synced: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'View sync completed',
        synced: syncedCount,
        dailySynced: dailySyncedCount,
        processed: viewKeys.length,
        results,
        dailyResults,
        summary: {
          totalViewsSynced: syncedCount,
          totalDailyRecordsSynced: dailySyncedCount,
          eventsProcessed: viewKeys.length,
          dailySyncErrors: dailyResults.reduce((sum, result) => sum + result.errors, 0),
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error in sync-views:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
