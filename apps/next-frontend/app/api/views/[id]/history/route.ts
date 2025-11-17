import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/redis-client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params;

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Obtener parámetros de consulta
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');
    const limit = Math.min(Math.max(days, 1), 30); // Máximo 30 días

    // Calcular fecha de inicio
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - limit);

    // Obtener datos históricos de views
    const viewsHistory = await prisma.evento_views_history.findMany({
      where: {
        eventoid: eventId,
        fecha: {
          gte: startDate,
        },
      },
      orderBy: {
        fecha: 'asc',
      },
    });

    // Obtener el total actual de views del evento
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { views: true },
    });

    const dbViews = event?.views || 0;
    const redisTotalRaw = await redisClient.get(`event:${eventId}:views`);
    const redisViews = redisTotalRaw ? Number.parseInt(redisTotalRaw, 10) : 0;
    const safeRedisViews = Number.isNaN(redisViews) ? 0 : redisViews;
    const totalViews = dbViews + safeRedisViews;

    // Mapear datos históricos por fecha para acceso rápido
    const historyByDate = new Map<string, number>();
    for (const item of viewsHistory) {
      const isoDate = item.fecha.toISOString().split('T')[0];
      historyByDate.set(isoDate, item.views_count);
    }

    // Generar datos para los últimos N días, incluyendo días sin datos
    const chartData = [] as Array<{ date: string; views: number; fullDate: string }>;
    const today = new Date();
    const dateEntries: Array<{
      formattedLabel: string;
      isoDate: string;
      dbCount: number;
    }> = [];

    for (let i = limit - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const isoDate = date.toISOString().split('T')[0];

      dateEntries.push({
        formattedLabel: date.toLocaleDateString('es-AR', {
          month: 'short',
          day: 'numeric',
        }),
        isoDate,
        dbCount: historyByDate.get(isoDate) || 0,
      });
    }

    const redisDailyKeys = dateEntries.map((entry) => `event:${eventId}:views:${entry.isoDate}`);
    const redisDailyValues = await redisClient.mget(redisDailyKeys);

    dateEntries.forEach((entry, index) => {
      const redisValueRaw = redisDailyValues[index];
      const redisDailyCount = redisValueRaw ? Number.parseInt(redisValueRaw, 10) : 0;
      const safeRedisDaily = Number.isNaN(redisDailyCount) ? 0 : redisDailyCount;
      const views = Math.max(entry.dbCount, safeRedisDaily);

      chartData.push({
        date: entry.formattedLabel,
        views,
        fullDate: entry.isoDate,
      });
    });

    // Calcular estadísticas
    const totalViewsInPeriod = chartData.reduce((sum, day) => sum + day.views, 0);
    const averageDailyViews = chartData.length
      ? Math.round(totalViewsInPeriod / chartData.length)
      : 0;
    const dailyCounts = chartData.map((day) => day.views);
    const maxDailyViews = dailyCounts.length ? Math.max(...dailyCounts) : 0;
    const minDailyViews = dailyCounts.length ? Math.min(...dailyCounts) : 0;

    return NextResponse.json({
      success: true,
      data: {
        chartData,
        totalViews,
        totalViewsInPeriod,
        averageDailyViews,
        maxDailyViews,
        minDailyViews,
        period: `${limit} días`,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching views history:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
