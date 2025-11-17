import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis-client';
import { prisma } from '@repo/db';
import telemetry from '@/lib/telemetry';

// Endpoint para procesar la cola (worker)
export async function POST(request: NextRequest) {
  try {
    const start = Date.now();
    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'eventId es requerido' }, { status: 400 });
    }

    // Obtener configuración de cola
    const queueConfig = await prisma.colas_evento.findFirst({
      where: { eventoid: eventId },
    });

    if (!queueConfig) {
      return NextResponse.json(
        { error: 'No hay configuración de cola para este evento' },
        { status: 404 },
      );
    }

    // Limpiar reservas expiradas primero
    await redisClient.cleanupExpiredReservations(eventId);

    // Procesar la cola
    const result = await redisClient.processQueue(eventId, queueConfig.max_concurrentes);

    // Actualizar estados en BD para usuarios que ahora pueden comprar
    if (result.newActiveUsers.length > 0) {
      await prisma.cola_turnos.updateMany({
        where: {
          usuarioid: { in: result.newActiveUsers },
          colas_evento: {
            eventoid: eventId,
          },
        },
        data: {
          estado: 'en_compra',
          fecha_atencion: new Date(),
        },
      });
    }

    try {
      telemetry.recordProcessingTime(Date.now() - start);
      telemetry.updateActiveUsers(result.newActiveUsers.length || 0);
      telemetry.recordQueueLength(result.processed || 0);
    } catch (err) {
      console.warn('Telemetry error (queue/process):', err);
    }

    return NextResponse.json({
      success: true,
      processed: result.processed,
      newActiveUsers: result.newActiveUsers,
    });
  } catch (error) {
    console.error('Error processing queue:', error);
    try {
      telemetry.recordProcessingTime(0);
    } catch (err) {
      /* ignore */
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Endpoint para obtener estadísticas de la cola
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId es requerido' }, { status: 400 });
    }

    const stats = await redisClient.getQueueStats(eventId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
