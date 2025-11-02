import { NextRequest, NextResponse } from 'next/server';
import { redisClient } from '@/lib/redis-client';

// Endpoint para obtener estadísticas en tiempo real de la cola
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId es requerido' }, { status: 400 });
    }

    const stats = await redisClient.getQueueStats(eventId);

    // Configurar headers para Server-Sent Events
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    const stream = new ReadableStream({
      start(controller) {
        // Enviar datos iniciales
        const initialData = `data: ${JSON.stringify(stats)}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialData));

        // Configurar intervalo para enviar updates
        const interval = setInterval(async () => {
          try {
            const updatedStats = await redisClient.getQueueStats(eventId);
            const data = `data: ${JSON.stringify(updatedStats)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          } catch (error) {
            console.error('Error sending queue update:', error);
          }
        }, 2000); // Actualizar cada 2 segundos

        // Limpiar intervalo cuando se cierre la conexión
        const cleanup = () => {
          clearInterval(interval);
        };

        // Escuchar cuando se cierre la conexión
        request.signal.addEventListener('abort', cleanup);
      },
    });

    return new Response(stream, { headers });
  } catch (error) {
    console.error('Error in queue SSE:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
 