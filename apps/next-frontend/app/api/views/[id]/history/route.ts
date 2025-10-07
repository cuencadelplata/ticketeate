import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const totalViews = event?.views || 0;

    // Generar datos para los últimos N días, incluyendo días sin datos
    const chartData = [];
    const today = new Date();
    
    for (let i = limit - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Buscar datos para esta fecha
      const dayData = viewsHistory.find(
        (item) => item.fecha.toDateString() === date.toDateString()
      );
      
      chartData.push({
        date: date.toLocaleDateString('es-AR', { 
          month: 'short', 
          day: 'numeric' 
        }),
        views: dayData?.views_count || 0,
        fullDate: date.toISOString().split('T')[0],
      });
    }

    // Calcular estadísticas
    const totalViewsInPeriod = chartData.reduce((sum, day) => sum + day.views, 0);
    const averageDailyViews = Math.round(totalViewsInPeriod / limit);
    const maxDailyViews = Math.max(...chartData.map(day => day.views));
    const minDailyViews = Math.min(...chartData.map(day => day.views));

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
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
