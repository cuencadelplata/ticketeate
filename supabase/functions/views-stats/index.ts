import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createRedisClient } from '../_shared/redis.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const redis = await createRedisClient();

    try {
      const viewKeys = await redis.keys('event:*:views');

      const stats = {
        pendingSync: viewKeys.length,
        totalPendingViews: 0,
        events: [],
      };

      for (const key of viewKeys) {
        const eventId = key.split(':')[1];
        const redisCount = await redis.get(key);

        if (!redisCount) continue;

        const count = parseInt(redisCount, 10);
        if (Number.isNaN(count)) continue;

        stats.totalPendingViews += count;
        stats.events.push({
          eventId,
          pendingViews: count,
        });
      }

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } finally {
      await redis.quit();
    }
  } catch (error) {
    console.error('Error getting views stats:', error);
    const isConfigError =
      error instanceof Error && error.message.includes('Redis connection environment variables');

    return new Response(
      JSON.stringify({
        error: isConfigError ? 'Redis not configured' : 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
