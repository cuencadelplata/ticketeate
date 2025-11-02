'use client';

import { useEffect, useState } from 'react';
import { X, Users, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useQueueRedis } from '@/hooks/use-queue-redis';
import { useRouter } from 'next/navigation';

interface QueueModalRedisProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  /** Si es true, redirige automáticamente cuando puede entrar */
  autoRedirect?: boolean;
}

export function QueueModalRedis({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  autoRedirect = true,
}: QueueModalRedisProps) {
  const router = useRouter();
  const [previousPosition, setPreviousPosition] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const {
    queueStatus,
    isLoading,
    isJoining,
    error,
    isInQueue,
    joinQueue,
    leaveQueue,
    canEnter,
    position,
    estimatedWaitTime,
  } = useQueueRedis(eventId, {
    pollingInterval: 3000,
    autoRedirect: false, // Manejamos el redirect manualmente para mostrar mensaje
    onCanEnter: () => {
      setShowSuccessMessage(true);

      // Esperar 2 segundos antes de redirigir
      if (autoRedirect) {
        setTimeout(() => {
          router.push(`/evento/comprar/${eventId}`);
        }, 2000);
      }
    },
    onPositionChange: (newPosition) => {
      setPreviousPosition(position);
    },
  });

  // Limpiar estados cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setShowSuccessMessage(false);
      setPreviousPosition(null);
    }
  }, [isOpen]);

  const handleJoinQueue = async () => {
    try {
      await joinQueue();
    } catch (err) {
      console.error('Error joining queue:', err);
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await leaveQueue();
      onClose();
    } catch (err) {
      console.error('Error leaving queue:', err);
    }
  };

  const handleEnterPurchase = () => {
    router.push(`/evento/comprar/${eventId}`);
    onClose();
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Cola de Compra</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isJoining}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Event Title */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Evento:</p>
          <p className="font-medium text-gray-900">{eventTitle}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200 animate-in slide-in-from-top duration-300">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Estado: No ha entrado a la cola */}
        {!isInQueue && !isJoining ? (
          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
              <div className="flex">
                <Users className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Sistema de cola activado</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Para garantizar una experiencia justa, hemos implementado una cola ordenada.
                    Recibirás acceso cuando sea tu turno.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleJoinQueue}
              className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Unirse a la Cola
            </button>
          </div>
        ) : isJoining ? (
          // Estado: Uniéndose a la cola
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">Uniéndote a la cola...</p>
          </div>
        ) : canEnter || showSuccessMessage ? (
          // Estado: Puede entrar a comprar
          <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <div className="flex">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                <div className="ml-3">
                  <h3 className="text-base font-semibold text-green-800">¡Es tu turno!</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Ya puedes proceder con tu compra. Tienes 5 minutos para completar el proceso.
                  </p>
                </div>
              </div>
            </div>

            {/* Animación de confetti o celebración podría ir aquí */}
            <div className="text-center py-2">
              <div className="inline-block animate-bounce">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
            </div>

            {autoRedirect ? (
              <div className="text-center text-sm text-gray-600 py-2">
                Redirigiendo a la página de compra...
              </div>
            ) : (
              <button
                onClick={handleEnterPurchase}
                className="w-full rounded-md bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Comenzar Compra
              </button>
            )}
          </div>
        ) : queueStatus ? (
          // Estado: En cola esperando
          <div className="space-y-4">
            <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
              <div className="flex">
                <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Esperando tu turno</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Estás en la posición <strong>{position}</strong> de{' '}
                    <strong>{queueStatus.totalInQueue}</strong> personas en cola.
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Tu progreso</span>
                <span>
                  {position === 1
                    ? 'Siguiente!'
                    : `${position} ${position === 1 ? 'persona' : 'personas'} adelante`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                    position === 1
                      ? 'bg-green-500'
                      : position && position <= 3
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.max(5, Math.min(100, ((queueStatus.totalInQueue - (position || 0) + 1) / queueStatus.totalInQueue) * 100))}%`,
                  }}
                />
              </div>

              {/* Indicador de cambio de posición */}
              {previousPosition !== null && previousPosition > (position || 0) && (
                <div className="text-center animate-in slide-in-from-top duration-300">
                  <p className="text-xs text-green-600 font-medium">
                    ⬆️ Avanzaste {previousPosition - (position || 0)} posición
                    {previousPosition - (position || 0) > 1 ? 'es' : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-gray-50 p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Tu posición</p>
                <p className="text-2xl font-bold text-gray-900">{position}</p>
              </div>
              <div className="rounded-md bg-gray-50 p-3 border border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Tiempo estimado</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(estimatedWaitTime)}</p>
              </div>
            </div>

            {/* Info adicional */}
            <div className="rounded-md bg-gray-50 p-3 border border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Personas en cola:</span>
                <span className="font-medium text-gray-900">{queueStatus.totalInQueue}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Comprando ahora:</span>
                <span className="font-medium text-gray-900">{queueStatus.totalActive}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Límite simultáneo:</span>
                <span className="font-medium text-gray-900">{queueStatus.maxConcurrent}</span>
              </div>
            </div>

            {/* Loading indicator durante refresh */}
            {isLoading && (
              <div className="flex items-center justify-center text-xs text-gray-500 py-2">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Actualizando posición...
              </div>
            )}

            {/* Botón abandonar */}
            <button
              onClick={handleLeaveQueue}
              disabled={isLoading}
              className="w-full rounded-md bg-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Abandonar Cola
            </button>
          </div>
        ) : null}

        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            {isInQueue ? '⚡ Actualizando cada 3 segundos' : 'Sistema de cola en tiempo real'}
          </p>
        </div>
      </div>
    </div>
  );
}
