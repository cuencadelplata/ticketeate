'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface QueueStatus {
  position: number;
  totalInQueue: number;
  totalActive: number;
  maxConcurrent: number;
  estimatedWaitTime: number;
  status: string;
  timestamp: number;
}

export interface QueueStats {
  eventId: string;
  totalInQueue: number;
  totalActive: number;
  totalCompleted: number;
  maxConcurrent: number;
  timestamp: number;
}

export function useQueue(eventId: string, userId: string) {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canEnter, setCanEnter] = useState(false);

  // Unirse a la cola usando Supabase Edge Function
  const joinQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('queue-operations', {
        body: { eventId, userId },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (functionError) {
        console.error('Edge Function Error:', functionError);
        throw new Error(functionError.message || 'Error al unirse a la cola');
      }

      setCanEnter(data.canEnter);

      if (data.canEnter) {
        // Puede entrar inmediatamente
        setQueueStatus({
          position: 0,
          totalInQueue: 0,
          totalActive: 1,
          maxConcurrent: 0,
          estimatedWaitTime: 0,
          status: 'en_compra',
          timestamp: Date.now(),
        });
      } else {
        // Está en cola, obtener posición
        await getQueuePosition(eventId, userId);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [eventId, userId]);

  // Obtener posición en la cola usando Supabase Edge Function
  const getQueuePosition = useCallback(
    async (currentEventId?: string, currentUserId?: string) => {
      const targetEventId = currentEventId || eventId;
      const targetUserId = currentUserId || userId;

      if (!targetEventId || !targetUserId) return;

      try {
        // Usar query parameters para el método GET
        const url = new URL(`${supabaseUrl}/functions/v1/queue-operations`);
        url.searchParams.set('eventId', targetEventId);
        url.searchParams.set('userId', targetUserId);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setQueueStatus(data);
        setCanEnter(data.position === 0);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
      }
    },
    [eventId, userId],
  );

  // Abandonar la cola usando Supabase Edge Function
  const leaveQueue = useCallback(async () => {
    try {
      const { data, error: functionError } = await supabase.functions.invoke('queue-operations', {
        method: 'POST',
        body: { eventId, userId },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (functionError) {
        throw new Error(functionError.message || 'Error al abandonar la cola');
      }

      setQueueStatus(null);
      setCanEnter(false);
      setError(null);

      return data.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    }
  }, [eventId, userId]);

  // Finalizar compra usando Supabase Edge Function
  const completePurchase = useCallback(
    async (success = true) => {
      try {
        const { data, error: functionError } = await supabase.functions.invoke('queue-complete', {
          body: { eventId, userId, success },
        });

        if (functionError) {
          throw new Error(functionError.message || 'Error al finalizar compra');
        }

        setQueueStatus(null);
        setCanEnter(false);

        return data.success;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
        return false;
      }
    },
    [eventId, userId],
  );

  // Formatear tiempo de espera
  const formatWaitTime = useCallback((seconds: number) => {
    if (seconds < 60) {
      return `${seconds} segundos`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }, []);

  return {
    queueStatus,
    isLoading,
    error,
    canEnter,
    joinQueue,
    getQueuePosition,
    leaveQueue,
    completePurchase,
    formatWaitTime,
  };
}

export function useQueueRealtime(eventId: string) {
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    // Suscribirse a updates de cola via Realtime
    const channel = supabase.channel(`queue:${eventId}`);

    channel.on('broadcast', { event: 'queue_update' }, (payload) => {
      console.log('Queue update received:', payload);

      // Actualizar estadísticas si es un update general
      if (payload.payload.action === 'processed') {
        setQueueStats((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            totalInQueue: prev.totalInQueue - payload.payload.processed,
            totalActive: prev.totalActive + payload.payload.newActiveUsers,
            timestamp: payload.payload.timestamp,
          };
        });
      }
    });

    // Suscribirse a cambios en la base de datos
    const subscription = supabase
      .channel('queue-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cola_turnos',
          filter: `colaid=in.(SELECT colaid FROM colas_evento WHERE eventoid=eq.${eventId})`,
        },
        (payload) => {
          console.log('Database change received:', payload);

          // Recargar estadísticas cuando hay cambios
          loadQueueStats();
        },
      )
      .subscribe();

    // Cargar estadísticas iniciales
    const loadQueueStats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_queue_stats', {
          event_id: eventId,
        });

        if (error) {
          console.error('Error loading queue stats:', error);
          setError(error.message);
        } else {
          setQueueStats(data);
          setIsConnected(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error in loadQueueStats:', err);
        setError('Error de conexión');
      }
    };

    loadQueueStats();

    return () => {
      channel.unsubscribe();
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [eventId]);

  return {
    queueStats,
    isConnected,
    error,
  };
}

// Hook para obtener posición específica del usuario
export function useUserQueuePosition(eventId: string, userId: string) {
  const [position, setPosition] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosition = useCallback(async () => {
    if (!eventId || !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_user_queue_position', {
        event_id: eventId,
        user_id: userId,
      });

      if (error) {
        throw new Error(error.message);
      }

      setPosition(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, userId]);

  useEffect(() => {
    loadPosition();

    // Suscribirse a updates específicos del usuario
    const channel = supabase.channel(`user-queue:${eventId}:${userId}`);

    channel.on('broadcast', { event: 'queue_update' }, (payload) => {
      if (payload.payload.userId === userId) {
        console.log('User queue update received:', payload);
        loadPosition(); // Recargar posición
      }
    });

    channel.subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [eventId, userId, loadPosition]);

  return {
    position,
    isLoading,
    error,
    refetch: loadPosition,
  };
}
