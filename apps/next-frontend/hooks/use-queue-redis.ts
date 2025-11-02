'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

export interface QueueStatus {
  position: number;
  totalInQueue: number;
  totalActive: number;
  maxConcurrent: number;
  estimatedWaitTime: number;
  canEnter: boolean;
}

export interface UseQueueOptions {
  /** Intervalo de polling en milisegundos (default: 3000) */
  pollingInterval?: number;
  /** Auto-redirect cuando puede entrar (default: true) */
  autoRedirect?: boolean;
  /** URL para redirect (default: /evento/comprar/[eventId]) */
  redirectUrl?: string;
  /** Callback cuando puede entrar a comprar */
  onCanEnter?: () => void;
  /** Callback cuando cambia la posición */
  onPositionChange?: (position: number) => void;
}

export function useQueueRedis(eventId: string, options: UseQueueOptions = {}) {
  const {
    pollingInterval = 3000,
    autoRedirect = false,
    redirectUrl,
    onCanEnter,
    onPositionChange,
  } = options;

  const router = useRouter();
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInQueue, setIsInQueue] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousPositionRef = useRef<number | null>(null);

  /**
   * Unirse a la cola
   */
  const joinQueue = useCallback(async () => {
    if (isJoining || isInQueue) return;

    setIsJoining(true);
    setError(null);

    try {
      const response = await fetch('/api/queue/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al unirse a la cola');
      }

      const data = await response.json();
      setIsInQueue(true);

      // Si puede entrar inmediatamente
      if (data.position?.position === 0 || data.position?.canEnter) {
        onCanEnter?.();

        if (autoRedirect) {
          const url = redirectUrl || `/evento/comprar/${eventId}`;
          router.push(url);
        }
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsJoining(false);
    }
  }, [eventId, isJoining, isInQueue, autoRedirect, redirectUrl, onCanEnter, router]);

  /**
   * Obtener estado de la cola
   */
  const fetchQueueStatus = useCallback(async () => {
    if (!eventId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/queue/status?eventId=${eventId}`);

      if (!response.ok) {
        throw new Error('Error al obtener estado de la cola');
      }

      const data = await response.json();
      const status: QueueStatus = data.status;

      setQueueStatus(status);

      // Detectar cambio de posición
      if (previousPositionRef.current !== null && previousPositionRef.current !== status.position) {
        onPositionChange?.(status.position);
      }
      previousPositionRef.current = status.position;

      // Si puede entrar, disparar callback
      if (status.canEnter && !queueStatus?.canEnter) {
        onCanEnter?.();

        if (autoRedirect) {
          const url = redirectUrl || `/evento/comprar/${eventId}`;
          router.push(url);
        }
      }

      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [
    eventId,
    queueStatus?.canEnter,
    onPositionChange,
    onCanEnter,
    autoRedirect,
    redirectUrl,
    router,
  ]);

  /**
   * Salir de la cola
   */
  const leaveQueue = useCallback(async () => {
    if (!eventId) return;

    try {
      const response = await fetch('/api/queue/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId }),
      });

      if (!response.ok) {
        throw new Error('Error al salir de la cola');
      }

      setIsInQueue(false);
      setQueueStatus(null);

      // Detener polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  }, [eventId]);

  /**
   * Iniciar polling cuando está en cola
   */
  useEffect(() => {
    if (isInQueue && !pollingIntervalRef.current) {
      // Primera consulta inmediata
      fetchQueueStatus();

      // Configurar polling
      pollingIntervalRef.current = setInterval(() => {
        fetchQueueStatus();
      }, pollingInterval);
    }

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isInQueue, pollingInterval, fetchQueueStatus]);

  /**
   * Refrescar estado manualmente
   */
  const refresh = useCallback(() => {
    return fetchQueueStatus();
  }, [fetchQueueStatus]);

  return {
    queueStatus,
    isLoading,
    isJoining,
    error,
    isInQueue,
    joinQueue,
    leaveQueue,
    refresh,
    canEnter: queueStatus?.canEnter ?? false,
    position: queueStatus?.position ?? null,
    estimatedWaitTime: queueStatus?.estimatedWaitTime ?? 0,
  };
}
