import { NextRequest, NextResponse } from 'next/server';
import { REDIS_CONFIG } from '@/lib/config';
import { prisma } from '@repo/db';

// Cliente Redis simple para Upstash
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

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.url}/keys/${pattern}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Redis KEYS error:', error);
      return [];
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
}

// Función para sincronizar contadores diarios de Redis a la base de datos
async function syncDailyViewsToDatabase(
  eventId: string,
  redis: RedisClient,
): Promise<{
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
      const date = new Date(dateStr + 'T00:00:00.000Z');

      try {
        // Obtener el conteo de Redis
        const redisCount = await redis.get(key);
        if (!redisCount) continue;

        const viewsCount = parseInt(redisCount);
        if (isNaN(viewsCount) || viewsCount <= 0) continue;

        // Insertar o actualizar en la base de datos
        await prisma.evento_views_history.upsert({
          where: {
            unique_evento_fecha: {
              eventoid: eventId,
              fecha: date,
            },
          },
          update: {
            views_count: viewsCount,
            updated_at: new Date(),
          },
          create: {
            id: `${eventId}_${dateStr}`,
            eventoid: eventId,
            fecha: date,
            views_count: viewsCount,
          },
        });

        result.synced++;
        result.details.push({
          date: dateStr,
          views: viewsCount,
          synced: true,
        });

        console.log(`Synced daily views for event ${eventId} on ${dateStr}: ${viewsCount} views`);
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
    console.error('Error in syncDailyViewsToDatabase:', error);
    result.errors++;
  }

  return result;
}

// Endpoint para sincronizar contadores diarios de un evento específico
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: eventId } = await params;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Verificar que Redis esté configurado
    if (!REDIS_CONFIG.url || !REDIS_CONFIG.token) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const redis = new RedisClient(REDIS_CONFIG.url, REDIS_CONFIG.token);

    // Sincronizar contadores diarios
    const syncResult = await syncDailyViewsToDatabase(eventId, redis);

    return NextResponse.json({
      success: true,
      message: 'Daily views sync completed',
      eventId,
      ...syncResult,
    });
  } catch (error) {
    console.error('Error syncing daily views:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Endpoint para obtener estadísticas de contadores diarios
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: eventId } = await params;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Verificar que Redis esté configurado
    if (!REDIS_CONFIG.url || !REDIS_CONFIG.token) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const redis = new RedisClient(REDIS_CONFIG.url, REDIS_CONFIG.token);

    // Obtener todas las claves de contadores diarios para este evento
    const dailyKeys = await redis.keys(`event:${eventId}:views:*`);

    const dailyStats = [];
    let totalDailyViews = 0;

    for (const key of dailyKeys) {
      const dateMatch = key.match(/event:.*:views:(\d{4}-\d{2}-\d{2})$/);
      if (!dateMatch) continue;

      const dateStr = dateMatch[1];
      const redisCount = await redis.get(key);

      if (redisCount) {
        const viewsCount = parseInt(redisCount);
        totalDailyViews += viewsCount;

        dailyStats.push({
          date: dateStr,
          views: viewsCount,
        });
      }
    }

    // Ordenar por fecha
    dailyStats.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      eventId,
      totalDailyViews,
      dailyStats,
      count: dailyStats.length,
    });
  } catch (error) {
    console.error('Error getting daily views stats:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
