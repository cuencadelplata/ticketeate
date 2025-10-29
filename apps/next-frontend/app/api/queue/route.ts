import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis-client';
import { prisma } from '@repo/db';

// Endpoint para unirse a la cola
export async function POST(request: NextRequest) {
  try {
    const { eventId, userId } = await request.json();

    if (!eventId || !userId) {
      return NextResponse.json({ error: 'eventId y userId son requeridos' }, { status: 400 });
    }

    // Obtener configuración de cola del evento
    const queueConfig = await prisma.colas_evento.findFirst({
      where: { eventoid: eventId },
    });

    if (!queueConfig) {
      return NextResponse.json(
        { error: 'No hay configuración de cola para este evento' },
        { status: 404 },
      );
    }

    // Intentar unirse a la cola
    const result = await redisClient.joinQueue(eventId, userId, queueConfig.max_concurrentes);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Error al unirse a la cola' },
        { status: 400 },
      );
    }

    // Si puede entrar inmediatamente, crear registro en BD
    if (result.canEnter && result.reservationId) {
      await prisma.cola_turnos.create({
        data: {
          turnoid: result.reservationId,
          colaid: queueConfig.colaid,
          usuarioid: userId,
          estado: 'en_compra',
          posicion: 0,
          fecha_atencion: new Date(),
        },
      });
    } else if (result.position !== undefined) {
      // Si está en cola, crear registro de espera
      await prisma.cola_turnos.create({
        data: {
          turnoid: `queue-${Date.now()}-${userId}`,
          colaid: queueConfig.colaid,
          usuarioid: userId,
          estado: 'esperando',
          posicion: result.position,
        },
      });
    }

    return NextResponse.json({
      success: true,
      canEnter: result.canEnter,
      position: result.position,
      reservationId: result.reservationId,
    });
  } catch (error) {
    console.error('Error joining queue:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Endpoint para obtener posición en la cola
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const userId = searchParams.get('userId');

    if (!eventId || !userId) {
      return NextResponse.json({ error: 'eventId y userId son requeridos' }, { status: 400 });
    }

    const queueStatus = await redisClient.getQueuePosition(eventId, userId);

    if (!queueStatus) {
      return NextResponse.json({ error: 'Usuario no está en la cola' }, { status: 404 });
    }

    return NextResponse.json(queueStatus);
  } catch (error) {
    console.error('Error getting queue position:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Endpoint para abandonar la cola
export async function DELETE(request: NextRequest) {
  try {
    const { eventId, userId } = await request.json();

    if (!eventId || !userId) {
      return NextResponse.json({ error: 'eventId y userId son requeridos' }, { status: 400 });
    }

    const success = await redisClient.leaveQueue(eventId, userId);

    if (success) {
      // Actualizar estado en BD
      await prisma.cola_turnos.updateMany({
        where: {
          usuarioid: userId,
          colas_evento: {
            eventoid: eventId,
          },
        },
        data: {
          estado: 'abandonado',
        },
      });
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error leaving queue:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
