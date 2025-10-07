import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simulación de cola en memoria (solo para desarrollo/testing)
const mockQueue = new Map<
  string,
  {
    users: string[];
    maxConcurrent: number;
    activeUsers: Set<string>;
  }
>();

serve(async (req) => {
  // Manejar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Iniciando función Edge queue-operations (MOCK)...');

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'join';

    console.log('Action:', action);

    // POST - Todas las operaciones de cola
    if (req.method === 'POST') {
      const { eventId, userId } = await req.json();
      console.log('Event ID:', eventId, 'User ID:', userId);

      if (!eventId || !userId) {
        return new Response(JSON.stringify({ error: 'eventId y userId son requeridos' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      switch (action) {
        case 'join': {
          console.log(`Intentando unirse a la cola para evento ${eventId}, usuario ${userId}`);

          // Inicializar cola si no existe
          if (!mockQueue.has(eventId)) {
            mockQueue.set(eventId, {
              users: [],
              maxConcurrent: 5,
              activeUsers: new Set(),
            });
          }

          const queue = mockQueue.get(eventId)!;

          // Verificar si el usuario ya está en la cola o activo
          if (queue.users.includes(userId) || queue.activeUsers.has(userId)) {
            return new Response(
              JSON.stringify({
                error: 'Usuario ya está en la cola o comprando',
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
              },
            );
          }

          // Verificar si hay espacio disponible
          if (queue.activeUsers.size < queue.maxConcurrent) {
            // Puede entrar inmediatamente
            queue.activeUsers.add(userId);

            console.log('Usuario puede entrar inmediatamente');

            return new Response(
              JSON.stringify({
                success: true,
                canEnter: true,
                position: 0,
                reservationId: `reservation-${eventId}-${userId}-${Date.now()}`,
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              },
            );
          } else {
            // Agregar a la cola
            queue.users.push(userId);
            const position = queue.users.length;

            console.log(`Usuario agregado a la cola en posición ${position}`);

            return new Response(
              JSON.stringify({
                success: true,
                canEnter: false,
                position: position,
              }),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
              },
            );
          }
        }

        case 'leave': {
          console.log(`Usuario ${userId} abandonando cola del evento ${eventId}`);

          const queue = mockQueue.get(eventId);
          if (queue) {
            // Remover de la cola
            const userIndex = queue.users.indexOf(userId);
            if (userIndex > -1) {
              queue.users.splice(userIndex, 1);
            }

            // Remover de activos
            queue.activeUsers.delete(userId);
          }

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        default:
          return new Response(JSON.stringify({ error: 'Acción no válida. Use: join, leave' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
      }
    }

    // GET - Obtener posición en la cola
    if (req.method === 'GET') {
      const eventId = url.searchParams.get('eventId');
      const userId = url.searchParams.get('userId');

      if (!eventId || !userId) {
        return new Response(JSON.stringify({ error: 'eventId y userId son requeridos' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const queue = mockQueue.get(eventId);
      if (!queue) {
        return new Response(JSON.stringify({ error: 'Usuario no está en la cola' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      // Verificar si está activo
      if (queue.activeUsers.has(userId)) {
        return new Response(
          JSON.stringify({
            position: 0,
            totalInQueue: queue.users.length,
            totalActive: queue.activeUsers.size,
            maxConcurrent: queue.maxConcurrent,
            estimatedWaitTime: 0,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
      }

      // Verificar posición en cola
      const position = queue.users.indexOf(userId);
      if (position === -1) {
        return new Response(JSON.stringify({ error: 'Usuario no está en la cola' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }

      // Estimar tiempo de espera (promedio 2 minutos por compra)
      const estimatedWaitTime = position * 120;

      return new Response(
        JSON.stringify({
          position: position + 1,
          totalInQueue: queue.users.length,
          totalActive: queue.activeUsers.size,
          maxConcurrent: queue.maxConcurrent,
          estimatedWaitTime: estimatedWaitTime,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    }

    return new Response(JSON.stringify({ error: 'Método no soportado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  } catch (error) {
    console.error('Error en queue operations (MOCK):', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
