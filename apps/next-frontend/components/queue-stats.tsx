'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useQueueRealtime } from '@/hooks/use-queue';

interface QueueStatsProps {
  eventId: string;
  className?: string;
}

export function QueueStats({ eventId, className = '' }: Readonly<QueueStatsProps>) {
  const { queueStats, isConnected, error } = useQueueRealtime(eventId);

  // compute progress percentage based on queue stats and inject CSS rule to avoid inline styles
  const progressPercent = queueStats
    ? Math.min(
        100,
        (queueStats.totalActive / Math.max(queueStats.totalActive + queueStats.totalInQueue, 1)) * 100,
      )
    : 0;
  const progressClass = `queue-progress-fill-${Math.round(progressPercent)}`;

  useEffect(() => {
    if (!queueStats) return;
    const styleId = `style-${progressClass}`;
    if (document.getElementById(styleId)) return;

    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.innerHTML = `.${progressClass} { width: ${Math.round(progressPercent)}%; }`;
    document.head.appendChild(styleEl);

    return () => {
      const existing = document.getElementById(styleId);
      if (existing) existing.remove();
    };
  }, [queueStats, progressClass, progressPercent]);

  if (error) {
    return (
      <div className={`rounded-md bg-red-50 p-3 ${className}`}>
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <p className="text-sm text-red-800">Error de conexión: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!queueStats) {
    return (
      <div className={`rounded-md bg-gray-50 p-3 ${className}`}>
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-gray-400 animate-pulse" />
          <div className="ml-3">
            <p className="text-sm text-gray-600">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-md bg-blue-50 p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <Users className="h-4 w-4 text-blue-500 mr-2" />
            <div
              className={`bg-blue-500 h-1 rounded-full transition-all duration-300 ${progressClass}`}
            />
            <span className="text-gray-600">{queueStats.totalInQueue} en cola</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
            <span className="text-gray-600">{queueStats.totalActive} comprando</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
            <span className="text-gray-600">{queueStats.totalCompleted} completados</span>
          </div>
        </div>
      </div>

      {queueStats.totalInQueue > 0 && (
        <div className="mt-2">
          <div className="text-xs text-gray-600 mb-1">
            Tiempo estimado de espera: {Math.ceil(queueStats.totalInQueue * 2)} minutos
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className={`bg-blue-500 h-1 rounded-full transition-all duration-300 ${progressClass}`}
            />
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Última actualización: {new Date(queueStats.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

interface QueueStatusBadgeProps {
  eventId: string;
  userId: string;
  className?: string;
}

export function QueueStatusBadge({ eventId, userId, className = '' }: Readonly<QueueStatusBadgeProps>) {
  const [status, setStatus] = useState<'idle' | 'in-queue' | 'can-enter' | 'error'>('idle');
  const [position, setPosition] = useState<number | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Usar Supabase Edge Function para obtener posición
        const response = await fetch(
          `/api/supabase/functions/queue-operations?eventId=${eventId}&userId=${userId}`,
        );
        const data = await response.json();

        if (response.ok) {
          if (data.position === 0) {
            setStatus('can-enter');
            setPosition(null);
          } else {
            setStatus('in-queue');
            setPosition(data.position);
          }
        } else {
          setStatus('idle');
          setPosition(null);
        }
      } catch (err: unknown) {
        // Log the error for debugging/monitoring, then update state to reflect the error
        console.error('Failed to fetch queue status', err);
        setStatus('error');
        setPosition(null);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, [eventId, userId]);

  if (status === 'idle') return null;

  return (
    <div
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}
    >
      {status === 'can-enter' && (
        <>
          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
          <span className="text-green-700">Tu turno</span>
        </>
      )}
      {status === 'in-queue' && position && (
        <>
          <Clock className="h-3 w-3 text-yellow-500 mr-1" />
          <span className="text-yellow-700">Posición {position}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
          <span className="text-red-700">Error</span>
        </>
      )}
    </div>
  );
}
