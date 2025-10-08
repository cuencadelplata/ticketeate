'use client';

import { useState, useEffect } from 'react';
import { X, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useMockQueue } from '@/hooks/use-mock-queue';

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
  } = useMockQueue(eventId, userId);

  const [hasJoined, setHasJoined] = useState(false);
  const [positionUpdateInterval, setPositionUpdateInterval] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedPosition, setAnimatedPosition] = useState<number | null>(null);

  // Efecto para actualizar posición periódicamente
  useEffect(() => {
    if (hasJoined && queueStatus && !canEnter) {
      const interval = setInterval(() => {
        getQueuePosition(eventId, userId);
      }, 5000); // Actualizar cada 5 segundos

      setPositionUpdateInterval(interval);

      return () => {
        clearInterval(interval);
      };
    } else if (positionUpdateInterval) {
      clearInterval(positionUpdateInterval);
      setPositionUpdateInterval(null);
    }
  }, [hasJoined, queueStatus, canEnter, getQueuePosition, eventId, userId]);

  // Limpiar intervalos al cerrar
  useEffect(() => {
    if (!isOpen && positionUpdateInterval) {
      clearInterval(positionUpdateInterval);
      setPositionUpdateInterval(null);
    }
  }, [isOpen]);

  // Limpiar estados cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setHasJoined(false);
      setIsAnimating(false);
      setAnimatedPosition(null);
    }
  }, [isOpen]);

  const handleJoinQueue = async () => {
    try {
      const result = await joinQueue();
      setHasJoined(true);

      // Si no puede entrar inmediatamente, iniciar animación de progreso
      if (!result.canEnter && result.position) {
        setIsAnimating(true);
        setAnimatedPosition(result.position);

        // Simular progreso en la cola con animación
        const animateProgress = () => {
          let currentPos = result.position;
          const animationInterval = setInterval(() => {
            if (currentPos > 1) {
              currentPos--;
              setAnimatedPosition(currentPos);
            } else {
              // Llegó a la posición 1, permitir entrada
              clearInterval(animationInterval);
              setIsAnimating(false);
              setAnimatedPosition(1);

              // Mostrar mensaje de éxito antes de redirigir
              setTimeout(() => {
                // Redirigir automáticamente a la página de compra
                handleEnterPurchase();
              }, 2000); // Dar tiempo para que el usuario vea que llegó a posición 1
            }
          }, 3000); // Cambiar posición cada 3 segundos para dar más tiempo
        };

        animateProgress();
      }
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
        ) : queueStatus || isAnimating ? (
          <div className="space-y-4">
            <div className="rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <Clock className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    {isAnimating ? 'Avanzando en la cola...' : 'Esperando tu turno'}
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    {isAnimating
                      ? `Estás avanzando hacia la posición 1...`
                      : `Estás en la posición ${queueStatus?.position} de ${queueStatus?.totalInQueue} personas en cola.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de progreso animada */}
            {isAnimating && animatedPosition && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progreso en la cola</span>
                  <span>Posición {animatedPosition}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                      animatedPosition === 1 ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{
                      width: `${Math.max(0, ((animatedPosition - 1) / Math.max(1, animatedPosition)) * 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {animatedPosition > 1
                    ? `Avanzando... ${animatedPosition - 1} posiciones restantes`
                    : '¡Es tu turno! Redirigiendo...'}
                </p>

                {/* Mensaje especial cuando llega a posición 1 */}
                {animatedPosition === 1 && (
                  <div className="rounded-md bg-green-50 p-3 border border-green-200">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        ¡Perfecto! Es tu turno para comprar
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-gray-600">Posición</p>
                <p className="text-lg font-semibold text-gray-900">
                  {isAnimating ? animatedPosition : queueStatus?.position}
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-gray-600">Tiempo estimado</p>
                <p className="text-lg font-semibold text-gray-900">
                  {isAnimating
                    ? `${Math.max(0, (animatedPosition || 1) - 1) * 2} min`
                    : formatWaitTime(queueStatus?.estimatedWaitTime || 0)}
                </p>
              </div>
            </div>

            <div className="rounded-md bg-gray-50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Personas en cola:</span>
                <span className="font-medium text-gray-900">{queueStatus?.totalInQueue || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Comprando ahora:</span>
                <span className="font-medium text-gray-900">{queueStatus?.totalActive || 0}</span>
              </div>
            </div>

            {!isAnimating && (
              <button
                onClick={handleLeaveQueue}
                className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Abandonar Cola
              </button>
            )}
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
