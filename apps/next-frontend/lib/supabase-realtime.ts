import { createClient } from '@supabase/supabase-js';
import { useEffect } from 'react';

// Configuración de Supabase para Realtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Función para publicar updates de cola
export async function publishQueueUpdate(eventId: string, data: any) {
  try {
    const { error } = await supabase.channel(`queue:${eventId}`).send({
      type: 'broadcast',
      event: 'queue_update',
      payload: {
        eventId,
        timestamp: Date.now(),
        ...data,
      },
    });

    if (error) {
      console.error('Error publishing queue update:', error);
    }
  } catch (error) {
    console.error('Error in publishQueueUpdate:', error);
  }
}

// Hook para suscribirse a updates de cola
export function useQueueRealtime(eventId: string, callback: (data: any) => void) {
  useEffect(() => {
    const channel = supabase.channel(`queue:${eventId}`);

    channel.on('broadcast', { event: 'queue_update' }, (payload) => {
      callback(payload.payload);
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [eventId, callback]);
}
