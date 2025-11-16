import { NextResponse } from 'next/server';
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

  async incr(key: string): Promise<number | null> {
    try {
      const response = await fetch(`${this.url}/incr/${key}`, {
        method: 'POST',
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
      console.error('Redis INCR error:', error);
      return null;
    }
  }
}

// Función para sincronizar contadores diarios de un evento específico
async function syncDailyViewsForEvent(eventId: string, redis: RedisClient): Promise<void> {
  try {
    // Obtener todas las claves de contadores diarios para este evento
    const dailyKeys = await redis.keys(`event:${eventId}:views:*`);

    for (const key of dailyKeys) {
      // Extraer la fecha de la clave (formato: event:eventId:views:YYYY-MM-DD)
      const dateMatch = key.match(/event:.*:views:(\d{4}-\d{2}-\d{2})$/);
      if (!dateMatch) continue;

      const dateStr = dateMatch[1];
      const date = new Date(dateStr + 'T00:00:00.000Z');

      // Obtener el conteo de Redis
      const redisCount = await redis.get(key);
      if (!redisCount) continue;

      const viewsCount = parseInt(redisCount);
      if (isNaN(viewsCount) || viewsCount <= 0) continue;

      // Insertar o actualizar en la base de datos
      await prisma.evento_views_history.upsert({
        where: {
          eventoid_fecha: {
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

      console.log(`Synced daily views for event ${eventId} on ${dateStr}: ${viewsCount} views`);
    }
  } catch (error) {
    console.error('Error syncing daily views for event:', error);
  }
}

export async function GET() {
  try {
    // Obtener estadísticas de views desde Redis
    if (!REDIS_CONFIG.url || !REDIS_CONFIG.token) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const redis = new RedisClient(REDIS_CONFIG.url, REDIS_CONFIG.token);

    // Obtener todas las claves de contadores de eventos
    const viewKeys = await redis.keys('event:*:views');

    const stats = {
      pendingSync: viewKeys.length,
      totalPendingViews: 0,
      events: [] as Array<{ eventId: string; pendingViews: number }>,
    };

    for (const key of viewKeys) {
      const eventId = key.split(':')[1];
      const redisCount = await redis.get(key);

      if (redisCount) {
        const count = parseInt(redisCount);
        stats.totalPendingViews += count;
        stats.events.push({
          eventId,
          pendingViews: count,
        });
      }
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching views stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch views stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    // Ejecutar sincronización manual de views
    if (!REDIS_CONFIG.url || !REDIS_CONFIG.token) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 });
    }

    const redis = new RedisClient(REDIS_CONFIG.url, REDIS_CONFIG.token);

    // Obtener todas las claves de contadores de eventos
    const viewKeys = await redis.keys('event:*:views');

    if (viewKeys.length === 0) {
      return NextResponse.json({ message: 'No view counters to sync', synced: 0 });
    }

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

        if (!redisCount) {
          continue;
        }

        const count = parseInt(redisCount);

        if (isNaN(count) || count <= 0) {
          continue;
        }

        // Actualizar la base de datos usando Prisma
        await prisma.eventos.update({
          where: { eventoid: eventId },
          data: {
            views: {
              increment: count,
            },
          },
        });

        // Sincronizar contadores diarios antes de eliminar las claves
        await syncDailyViewsForEvent(eventId, redis);

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

    return NextResponse.json({
      message: 'View sync completed',
      synced: syncedCount,
      processed: viewKeys.length,
      results,
    });
  } catch (error) {
    console.error('Error syncing views:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync views',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
