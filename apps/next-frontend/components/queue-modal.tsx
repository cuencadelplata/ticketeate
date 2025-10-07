'use client';

import { useState, useEffect } from 'react';
import { X, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useQueue } from '@/hooks/use-queue';

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  userId: string;
  eventTitle: string;
  onEnterPurchase: () => void;
}

export function QueueModal({
  isOpen,
  onClose,
  eventId,
  userId,
  eventTitle,
  onEnterPurchase,
}: QueueModalProps) {
  const {
    queueStatus,
    isLoading,
    error,
    canEnter,
    joinQueue,
    getQueuePosition,
    leaveQueue,
    formatWaitTime,
  } = useQueue(eventId, userId);

  const [hasJoined, setHasJoined] = useState(false);
  const [positionUpdateInterval, setPositionUpdateInterval] = useState<NodeJS.Timeout | null>(null);

  // Efecto para actualizar posición periódicamente
  useEffect(() => {
    if (hasJoined && queueStatus && !canEnter) {
      const interval = setInterval(() => {
        getQueuePosition();
      }, 5000); // Actualizar cada 5 segundos

      setPositionUpdateInterval(interval);

      return () => {
        clearInterval(interval);
      };
    } else if (positionUpdateInterval) {
      clearInterval(positionUpdateInterval);
      setPositionUpdateInterval(null);
    }
  }, [hasJoined, queueStatus, canEnter, getQueuePosition]);

  // Limpiar intervalos al cerrar
  useEffect(() => {
    if (!isOpen && positionUpdateInterval) {
      clearInterval(positionUpdateInterval);
      setPositionUpdateInterval(null);
    }
  }, [isOpen]);

  const handleJoinQueue = async () => {
    try {
      await joinQueue();
      setHasJoined(true);
    } catch (err) {
      console.error('Error joining queue:', err);
    }
  };

  const handleLeaveQueue = async () => {
    try {
      await leaveQueue();
      setHasJoined(false);
      onClose();
    } catch (err) {
      console.error('Error leaving queue:', err);
    }
  };

  const handleEnterPurchase = () => {
    onEnterPurchase();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Cola de Compra</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Evento:</p>
          <p className="font-medium text-gray-900">{eventTitle}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!hasJoined ? (
          <div className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <Users className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Hay muchas personas comprando
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Para evitar sobrecarga del sistema, hemos implementado una cola ordenada. Te
                    notificaremos cuando sea tu turno.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleJoinQueue}
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Uniéndose a la cola...' : 'Unirse a la Cola'}
            </button>
          </div>
        ) : canEnter ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">¡Es tu turno!</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Ya puedes proceder con tu compra. Tienes 5 minutos para completar el proceso.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleEnterPurchase}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Comenzar Compra
            </button>
          </div>
        ) : queueStatus ? (
          <div className="space-y-4">
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <Clock className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Esperando tu turno</h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Estás en la posición {queueStatus.position} de {queueStatus.totalInQueue}{' '}
                    personas en cola.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-gray-600">Posición</p>
                <p className="text-lg font-semibold text-gray-900">{queueStatus.position}</p>
              </div>
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-gray-600">Tiempo estimado</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatWaitTime(queueStatus.estimatedWaitTime)}
                </p>
              </div>
            </div>

            <div className="rounded-md bg-gray-50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Personas en cola:</span>
                <span className="font-medium text-gray-900">{queueStatus.totalInQueue}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Comprando ahora:</span>
                <span className="font-medium text-gray-900">{queueStatus.totalActive}</span>
              </div>
            </div>

            <button
              onClick={handleLeaveQueue}
              className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Abandonar Cola
            </button>
          </div>
        ) : null}

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            La cola se actualiza automáticamente cada 5 segundos
          </p>
        </div>
      </div>
    </div>
  );
}
