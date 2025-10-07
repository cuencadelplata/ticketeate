'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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

// Simulación de cola en memoria (solo para desarrollo/testing)
const mockQueueData = new Map<
  string,
  {
    users: string[];
    maxConcurrent: number;
    activeUsers: Set<string>;
    completedUsers: Set<string>;
  }
>();

export function useMockQueue(eventId: string, userId: string) {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canEnter, setCanEnter] = useState(false);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Inicializar cola si no existe
  useEffect(() => {
    console.log('useMockQueue - eventId:', eventId, 'userId:', userId);

    if (!mockQueueData.has(eventId)) {
      mockQueueData.set(eventId, {
        users: [],
        maxConcurrent: 5,
        activeUsers: new Set(),
        completedUsers: new Set(),
      });
    }

    // Verificar si el usuario ya está activo (viene de otra página)
    const queue = mockQueueData.get(eventId);
    console.log('useMockQueue - queue state:', queue);
    console.log('useMockQueue - user in activeUsers:', queue?.activeUsers.has(userId));

    if (queue && queue.activeUsers.has(userId)) {
      console.log('useMockQueue - setting canEnter to true');
      setCanEnter(true);
      setQueueStatus({
        position: 0,
        totalInQueue: queue.users.length,
        totalActive: queue.activeUsers.size,
        maxConcurrent: queue.maxConcurrent,
        estimatedWaitTime: 0,
        status: 'en_compra',
        timestamp: Date.now(),
      });
    }
  }, [eventId, userId]);

  // Unirse a la cola (simulado)
  const joinQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const queue = mockQueueData.get(eventId);
      if (!queue) {
        throw new Error('Cola no encontrada');
      }

      // Verificar si el usuario ya está en la cola o activo
      if (queue.users.includes(userId) || queue.activeUsers.has(userId)) {
        throw new Error('Usuario ya está en la cola o comprando');
      }

      // Verificar si hay espacio disponible
      if (queue.activeUsers.size < queue.maxConcurrent) {
        // Puede entrar inmediatamente
        queue.activeUsers.add(userId);
        setCanEnter(true);

        setQueueStatus({
          position: 0,
          totalInQueue: queue.users.length,
          totalActive: queue.activeUsers.size,
          maxConcurrent: queue.maxConcurrent,
          estimatedWaitTime: 0,
          status: 'en_compra',
          timestamp: Date.now(),
        });

        return {
          success: true,
          canEnter: true,
          position: 0,
          reservationId: `reservation-${eventId}-${userId}-${Date.now()}`,
        };
      } else {
        // Agregar a la cola
        queue.users.push(userId);
        const position = queue.users.length;
        setCanEnter(false);

        setQueueStatus({
          position: position,
          totalInQueue: queue.users.length,
          totalActive: queue.activeUsers.size,
          maxConcurrent: queue.maxConcurrent,
          estimatedWaitTime: position * 120, // 2 minutos por posición
          status: 'esperando',
          timestamp: Date.now(),
        });

        return {
          success: true,
          canEnter: false,
          position: position,
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [eventId, userId]);

  // Obtener posición en la cola (simulado)
  const getQueuePosition = useCallback(
    async (currentEventId?: string, currentUserId?: string) => {
      const targetEventId = currentEventId || eventId;
      const targetUserId = currentUserId || userId;

      if (!targetEventId || !targetUserId) return;

      try {
        // Simular delay de red
        await new Promise((resolve) => setTimeout(resolve, 500));

        const queue = mockQueueData.get(targetEventId);
        if (!queue) {
          throw new Error('Usuario no está en la cola');
        }

        // Verificar si está activo
        if (queue.activeUsers.has(targetUserId)) {
          setQueueStatus({
            position: 0,
            totalInQueue: queue.users.length,
            totalActive: queue.activeUsers.size,
            maxConcurrent: queue.maxConcurrent,
            estimatedWaitTime: 0,
            status: 'en_compra',
            timestamp: Date.now(),
          });
          setCanEnter(true);
          return;
        }

        // Verificar posición en cola
        const position = queue.users.indexOf(targetUserId);
        if (position === -1) {
          throw new Error('Usuario no está en la cola');
        }

        const estimatedWaitTime = position * 120;

        setQueueStatus({
          position: position + 1,
          totalInQueue: queue.users.length,
          totalActive: queue.activeUsers.size,
          maxConcurrent: queue.maxConcurrent,
          estimatedWaitTime: estimatedWaitTime,
          status: 'esperando',
          timestamp: Date.now(),
        });
        setCanEnter(position === 0 && queue.activeUsers.size < queue.maxConcurrent);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        setError(errorMessage);
      }
    },
    [eventId, userId],
  );

  // Abandonar la cola (simulado)
  const leaveQueue = useCallback(async () => {
    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500));

      const queue = mockQueueData.get(eventId);
      if (queue) {
        // Remover de la cola
        const userIndex = queue.users.indexOf(userId);
        if (userIndex > -1) {
          queue.users.splice(userIndex, 1);
        }

        // Remover de activos
        queue.activeUsers.delete(userId);
      }

      setQueueStatus(null);
      setCanEnter(false);
      setError(null);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return false;
    }
  }, [eventId, userId]);

  // Finalizar compra (simulado)
  const completePurchase = useCallback(
    async (success = true) => {
      try {
        // Simular delay de red
        await new Promise((resolve) => setTimeout(resolve, 500));

        const queue = mockQueueData.get(eventId);
        if (queue) {
          // Remover de activos
          queue.activeUsers.delete(userId);

          if (success) {
            queue.completedUsers.add(userId);
          }

          // Procesar siguiente usuario en cola
          if (queue.users.length > 0 && queue.activeUsers.size < queue.maxConcurrent) {
            const nextUser = queue.users.shift()!;
            queue.activeUsers.add(nextUser);
          }
        }

        setQueueStatus(null);
        setCanEnter(false);

        return true;
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

  // Simular actualizaciones automáticas de posición
  useEffect(() => {
    if (queueStatus && !canEnter && queueStatus.status === 'esperando') {
      positionUpdateInterval.current = setInterval(() => {
        getQueuePosition();
      }, 5000); // Actualizar cada 5 segundos

      return () => {
        if (positionUpdateInterval.current) {
          clearInterval(positionUpdateInterval.current);
        }
      };
    }
  }, [queueStatus, canEnter, getQueuePosition]);

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

// Hook para estadísticas de cola (simulado)
export function useMockQueueRealtime(eventId: string) {
  const [queueStats, setQueueStats] = useState<QueueStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const updateStats = () => {
      const queue = mockQueueData.get(eventId);
      if (queue) {
        setQueueStats({
          eventId,
          totalInQueue: queue.users.length,
          totalActive: queue.activeUsers.size,
          totalCompleted: queue.completedUsers.size,
          maxConcurrent: queue.maxConcurrent,
          timestamp: Date.now(),
        });
        setIsConnected(true);
        setError(null);
      }
    };

    // Actualizar estadísticas iniciales
    updateStats();

    // Simular actualizaciones en tiempo real
    const interval = setInterval(updateStats, 2000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [eventId]);

  return {
    queueStats,
    isConnected,
    error,
  };
}

// Hook para obtener posición específica del usuario (simulado)
export function useMockUserQueuePosition(eventId: string, userId: string) {
  const [position, setPosition] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosition = useCallback(async () => {
    if (!eventId || !userId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500));

      const queue = mockQueueData.get(eventId);
      if (!queue) {
        throw new Error('Usuario no está en la cola');
      }

      // Verificar si está activo
      if (queue.activeUsers.has(userId)) {
        setPosition({
          position: 0,
          totalInQueue: queue.users.length,
          totalActive: queue.activeUsers.size,
          maxConcurrent: queue.maxConcurrent,
          estimatedWaitTime: 0,
          status: 'en_compra',
          timestamp: Date.now(),
        });
        return;
      }

      // Verificar posición en cola
      const userPosition = queue.users.indexOf(userId);
      if (userPosition === -1) {
        throw new Error('Usuario no está en la cola');
      }

      const estimatedWaitTime = userPosition * 120;

      setPosition({
        position: userPosition + 1,
        totalInQueue: queue.users.length,
        totalActive: queue.activeUsers.size,
        maxConcurrent: queue.maxConcurrent,
        estimatedWaitTime: estimatedWaitTime,
        status: 'esperando',
        timestamp: Date.now(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, userId]);

  useEffect(() => {
    loadPosition();

    // Simular actualizaciones periódicas
    const interval = setInterval(loadPosition, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [eventId, userId, loadPosition]);

  return {
    position,
    isLoading,
    error,
    refetch: loadPosition,
  };
}
