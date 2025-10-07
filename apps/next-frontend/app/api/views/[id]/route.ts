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

  async set(key: string, value: string, ex?: number): Promise<boolean> {
    try {
      const url = ex ? `${this.url}/set/${key}/${value}/ex/${ex}` : `${this.url}/set/${key}/${value}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
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

  async exists(key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.url}/exists/${key}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }
}

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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Verificar que Redis esté configurado
    if (!REDIS_CONFIG.url || !REDIS_CONFIG.token) {
      console.warn('Redis not configured, skipping view count');
      return NextResponse.json({ success: true, message: 'Redis not configured' });
    }

    const redis = new RedisClient(REDIS_CONFIG.url, REDIS_CONFIG.token);
    
    // Generar identificador único del visitante
    const visitorId = getVisitorId(request);
    const visitorKey = `visitor:${eventId}:${visitorId}`;
    const viewKey = `event:${eventId}:views`;
    
    // Verificar si este visitante ya contó en las últimas 24 horas
    const hasVisited = await redis.exists(visitorKey);
    
    if (hasVisited) {
      return NextResponse.json({ 
        success: true, 
        message: 'View already counted for this visitor',
        counted: false 
      });
    }

    // Incrementar contador de views
    const newCount = await redis.incr(viewKey);
    
    if (newCount === null) {
      return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 });
    }

    // Marcar al visitante como contado por 24 horas
    await redis.set(visitorKey, '1', 86400); // 24 horas en segundos

    return NextResponse.json({ 
      success: true, 
      message: 'View counted successfully',
      counted: true,
      totalViews: newCount
    });

  } catch (error) {
    console.error('Error counting view:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Endpoint para obtener el conteo actual de views
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Verificar que Redis esté configurado
    if (!REDIS_CONFIG.url || !REDIS_CONFIG.token) {
      // Si Redis no está configurado, obtener desde la base de datos
      const event = await prisma.eventos.findUnique({
        where: { eventoid: eventId },
        select: { views: true }
      });
      
      return NextResponse.json({ 
        views: event?.views || 0,
        source: 'database'
      });
    }

    const redis = new RedisClient(REDIS_CONFIG.url, REDIS_CONFIG.token);
    const viewKey = `event:${eventId}:views`;
    
    const redisCount = await redis.get(viewKey);
    const redisViews = redisCount ? parseInt(redisCount) : 0;
    
    // También obtener el conteo de la base de datos
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { views: true }
    });
    
    const dbViews = event?.views || 0;
    
    return NextResponse.json({ 
      views: dbViews + redisViews,
      redisViews,
      dbViews,
      source: 'combined'
    });

  } catch (error) {
    console.error('Error getting view count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
