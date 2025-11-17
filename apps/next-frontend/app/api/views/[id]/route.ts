import { NextRequest, NextResponse } from 'next/server';
import { REDIS_CONFIG } from '@/lib/config';
import { prisma } from '@repo/db';
import { redisClient } from '@/lib/redis-client';
import { Buffer } from 'buffer';

// Función para obtener IP del usuario
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();

  return 'unknown';
}

// Función para generar un identificador único del visitante
function getVisitorId(request: NextRequest): string {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Crear un hash simple del IP + User Agent para identificar visitantes únicos
  return Buffer.from(`${ip}-${userAgent}`).toString('base64').slice(0, 32);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Verificar que Redis esté configurado
    if (!REDIS_CONFIG.url) {
      console.warn('Redis not configured, skipping view count');
      return NextResponse.json({ success: true, message: 'Redis not configured' });
    }

    const redis = redisClient;

    // Generar identificador único del visitante
    const visitorId = getVisitorId(request);
    const visitorKey = `visitor:${eventId}:${visitorId}`;
    const viewKey = `event:${eventId}:views`;

    // Crear clave para el contador diario
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const dailyViewKey = `event:${eventId}:views:${today}`;

    // Verificar si este visitante ya contó en las últimas 24 horas
    const hasVisited = await redis.exists(visitorKey);

    if (hasVisited) {
      return NextResponse.json({
        success: true,
        message: 'View already counted for this visitor',
        counted: false,
      });
    }

    // Incrementar contador total de views
    const newCount = await redis.incr(viewKey);

    if (newCount === null) {
      return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 });
    }

    // Incrementar contador diario de views
    const newDailyCount = await redis.incr(dailyViewKey);

    if (newDailyCount !== null) {
      // Establecer expiración para el contador diario (7 días)
      const dailyStored = await redis.set(dailyViewKey, newDailyCount.toString(), 7 * 24 * 60 * 60);
      if (!dailyStored) {
        console.warn(`Failed to persist daily view key ${dailyViewKey}`);
      }
    } else {
      console.warn(`Failed to increment daily view key ${dailyViewKey}`);
    }

    // Marcar al visitante como contado por 24 horas
    const visitorStored = await redis.set(visitorKey, '1', 86400); // 24 horas en segundos
    if (!visitorStored) {
      console.warn(`Failed to persist visitor key ${visitorKey}`);
    }

    return NextResponse.json({
      success: true,
      message: 'View counted successfully',
      counted: true,
      totalViews: newCount,
    });
  } catch (error) {
    console.error('Error counting view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Endpoint para obtener el conteo actual de views
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Verificar que Redis esté configurado
    if (!REDIS_CONFIG.url) {
      // Si Redis no está configurado, obtener desde la base de datos
      const event = await prisma.eventos.findUnique({
        where: { eventoid: eventId },
        select: { views: true },
      });

      return NextResponse.json({
        views: event?.views || 0,
        source: 'database',
      });
    }

    const redis = redisClient;
    const viewKey = `event:${eventId}:views`;

    const redisCount = await redis.get(viewKey);
    const redisViewsRaw = redisCount ? Number.parseInt(redisCount, 10) : 0;
    const redisViews = Number.isNaN(redisViewsRaw) ? 0 : redisViewsRaw;

    // También obtener el conteo de la base de datos
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { views: true },
    });

    const dbViews = event?.views || 0;

    return NextResponse.json({
      views: dbViews + redisViews,
      redisViews,
      dbViews,
      source: 'combined',
    });
  } catch (error) {
    console.error('Error getting view count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
