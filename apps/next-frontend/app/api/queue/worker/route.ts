import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis-client';
import { prisma } from '@repo/db';

// Worker principal para procesar todas las colas
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 Iniciando worker de colas...');

  try {
    // Obtener todas las colas activas
    const activeQueues = await prisma.colas_evento.findMany({
      include: {
        eventos: {
          select: {
            titulo: true,
            estado: true,
          },
        },
      },
      where: {
        eventos: {
          estado: 'ACTIVO', // Solo procesar eventos activos
        },
      },
    });

    console.log(`📋 Encontradas ${activeQueues.length} colas activas`);

    const results = [];
    let totalProcessed = 0;
    let totalCleaned = 0;

    for (const queue of activeQueues) {
      try {
        console.log(`🔄 Procesando cola para evento: ${queue.eventos.titulo}`);

        // Limpiar reservas expiradas
        const cleaned = await redisClient.cleanupExpiredReservations(queue.eventoid);
        totalCleaned += cleaned;

        // Procesar la cola
        const result = await redisClient.processQueue(queue.eventoid, queue.max_concurrentes);

        // Actualizar estados en BD
        if (result.newActiveUsers.length > 0) {
          await prisma.cola_turnos.updateMany({
            where: {
              usuarioid: { in: result.newActiveUsers },
              colaid: queue.colaid,
            },
            data: {
              estado: 'en_compra',
              fecha_atencion: new Date(),
            },
          });
        }

        totalProcessed += result.processed;

        results.push({
          eventId: queue.eventoid,
          eventTitle: queue.eventos.titulo,
          processed: result.processed,
          newActiveUsers: result.newActiveUsers.length,
          cleanedExpired: cleaned,
        });

        console.log(
          `✅ Evento ${queue.eventos.titulo}: ${result.processed} procesados, ${cleaned} limpiados`,
        );
      } catch (error) {
        console.error(`❌ Error procesando cola para evento ${queue.eventoid}:`, error);
        results.push({
          eventId: queue.eventoid,
          eventTitle: queue.eventos.titulo,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`🏁 Worker completado en ${duration}ms`);

    return NextResponse.json({
      success: true,
      duration,
      processedQueues: results.length,
      totalProcessed,
      totalCleaned,
      results,
    });
  } catch (error) {
    console.error('❌ Error en worker principal:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// Endpoint para procesar una cola específica
export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: 'eventId es requerido' }, { status: 400 });
    }

    console.log(`🔄 Procesando cola específica para evento: ${eventId}`);

    // Obtener configuración de cola
    const queueConfig = await prisma.colas_evento.findFirst({
      where: { eventoid: eventId },
      include: {
        eventos: {
          select: { titulo: true, estado: true },
        },
      },
    });

    if (!queueConfig) {
      return NextResponse.json(
        { error: 'No hay configuración de cola para este evento' },
        { status: 404 },
      );
    }

    // Limpiar reservas expiradas
    const cleaned = await redisClient.cleanupExpiredReservations(eventId);
    console.log(`🧹 Limpiadas ${cleaned} reservas expiradas`);

    // Procesar la cola
    const result = await redisClient.processQueue(eventId, queueConfig.max_concurrentes);

    // Actualizar estados en BD
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

    console.log(
      `✅ Procesados ${result.processed} usuarios, ${result.newActiveUsers.length} ahora activos`,
    );

    return NextResponse.json({
      success: true,
      processed: result.processed,
      newActiveUsers: result.newActiveUsers,
      cleanedExpired: cleaned,
    });
  } catch (error) {
    console.error('❌ Error procesando cola específica:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
