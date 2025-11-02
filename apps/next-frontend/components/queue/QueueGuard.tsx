'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Clock } from 'lucide-react';

interface QueueGuardProps {
  children: ReactNode;
  eventId: string;
  /** Si es true, permite el acceso sin verificar la cola (útil para testing) */
  bypassQueue?: boolean;
  /** URL de redirect si no tiene acceso */
  redirectUrl?: string;
  /** Callback cuando no tiene acceso */
  onAccessDenied?: () => void;
}

interface QueueStatus {
  canEnter: boolean;
  position?: number;
  totalInQueue?: number;
  estimatedWaitTime?: number;
}

/**
 * QueueGuard - Componente que verifica el acceso a la cola antes de permitir checkout
 * 
 * Verifica que:
 * 1. El usuario esté autenticado
 * 2. El usuario esté en la cola activa para el evento
 * 3. No haya expirado su tiempo de compra
 * 
 * Si no cumple, redirige a la página del evento
 */
export function QueueGuard({
  children,
  eventId,
  bypassQueue = false,
  redirectUrl,
  onAccessDenied,
}: QueueGuardProps) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si se bypasea la cola, permitir acceso directo
    if (bypassQueue) {
      setHasAccess(true);
      setIsVerifying(false);
      return;
    }

    verifyQueueAccess();
  }, [eventId, bypassQueue]);

  const verifyQueueAccess = async () => {
    setIsVerifying(true);
    setError(null);

    try {
      // Obtener userId del sessionStorage (usado en evento-content)
      const storedUserId = typeof window !== 'undefined' ? sessionStorage.getItem('queueUserId') : null;
      
      if (!storedUserId) {
        console.error('[QueueGuard] No userId found in sessionStorage');
        throw new Error('Usuario no autenticado');
      }
      
      console.log('[QueueGuard] Starting verification for userId:', storedUserId, 'eventId:', eventId);

      // Delay inicial para dar tiempo a que Redis procese completamente
      // Si el usuario acaba de unirse, esto da tiempo a que se cree la reserva
      console.log('[QueueGuard] Initial delay of 800ms...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Intentar promover usuarios de la cola antes de verificar
      await fetch('/api/queue/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      }).catch(() => {
        // Ignorar errores de promoción, no es crítico
        console.warn('[QueueGuard] Could not process queue promotion');
      });
      
      // Retry logic: intentar 5 veces con delay creciente entre intentos
      // Esto maneja el caso donde el usuario acaba de unirse y Redis aún está procesando
      let attempts = 0;
      let maxAttempts = 5;
      let status: QueueStatus | null = null;
      
      while (attempts < maxAttempts) {
        attempts++;
        
        // Delay antes de verificar (excepto en el primer intento)
        if (attempts > 1) {
          const delay = attempts * 300; // 300ms, 600ms, 900ms, 1200ms
          console.log(`[QueueGuard] Waiting ${delay}ms before attempt ${attempts}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Verificar estado de la cola con el mismo userId
        const response = await fetch(`/api/queue/status?eventId=${eventId}&userId=${storedUserId}`);

        if (!response.ok) {
          console.error(`[QueueGuard] API error on attempt ${attempts}:`, response.status);
          if (attempts < maxAttempts) {
            continue;
          }
          throw new Error('Error al verificar estado de la cola');
        }

        const data = await response.json();
        const apiStatus = data.status;

        console.log(`[QueueGuard] Queue status (attempt ${attempts}/${maxAttempts}):`, {
          canEnter: apiStatus.canEnter,
          userPosition: apiStatus.userPosition,
          queueLength: apiStatus.queueLength,
          activeBuyers: apiStatus.activeBuyers,
        });

        status = {
          canEnter: apiStatus.canEnter,
          position: apiStatus.userPosition,
          totalInQueue: apiStatus.queueLength,
          estimatedWaitTime: apiStatus.estimatedWaitTime,
        };

        // Si puede entrar, salir del loop
        if (status.canEnter) {
          console.log('[QueueGuard] ✓ Access granted!');
          break;
        }

        // Si no puede entrar y es el último intento, aceptar el resultado
        if (attempts >= maxAttempts) {
          console.log('[QueueGuard] ✗ Max attempts reached, denying access');
          break;
        }

        console.log('[QueueGuard] Cannot enter yet, will retry...');
      }

      if (!status) {
        throw new Error('No se pudo verificar el estado de la cola');
      }

      setQueueStatus(status);

      console.log('[QueueGuard] Final decision - Can enter?', status.canEnter);

      // Si puede entrar, permitir acceso
      if (status.canEnter) {
        setHasAccess(true);
      } else {
        // No tiene acceso, redirigir
        console.log('[QueueGuard] Access denied, redirecting...');
        handleAccessDenied(status);
      }
    } catch (err) {
      console.error('Error verifying queue access:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // En caso de error, permitir acceso (fail-safe)
      // TODO: En producción, considerar ser más restrictivo
      setHasAccess(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAccessDenied = (status: QueueStatus) => {
    // Llamar callback si existe
    onAccessDenied?.();

    // Esperar un momento para mostrar el mensaje
    setTimeout(() => {
      const redirect = redirectUrl || `/evento/${eventId}`;
      router.push(redirect);
    }, 2000);
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
          <p className="text-white text-xl">Verificando acceso...</p>
          <p className="text-gray-400 text-sm">Comprobando tu posición en la cola</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="max-w-md text-center space-y-4 p-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-white text-2xl font-bold">Error de Verificación</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => router.push(`/evento/${eventId}`)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Evento
          </button>
        </div>
      </div>
    );
  }

  // Access denied state
  if (!hasAccess && queueStatus) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="max-w-md text-center space-y-6 p-6 bg-gray-900 rounded-lg border border-gray-800">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto" />
          <h2 className="text-white text-2xl font-bold">Acceso Denegado</h2>
          
          <div className="space-y-3 text-left bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Tu posición:</span>
              <span className="text-white font-semibold">{queueStatus.position || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">En cola:</span>
              <span className="text-white font-semibold">{queueStatus.totalInQueue || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tiempo estimado:</span>
              <span className="text-white font-semibold">
                {queueStatus.estimatedWaitTime 
                  ? `${Math.floor(queueStatus.estimatedWaitTime / 60)}m` 
                  : 'Calculando...'}
              </span>
            </div>
          </div>

          <p className="text-gray-400 text-sm">
            Aún no es tu turno para comprar. Por favor espera en la cola o vuelve más tarde.
          </p>

          <div className="text-sm text-gray-500">
            Redirigiendo en 2 segundos...
          </div>
        </div>
      </div>
    );
  }

  // Has access, render children
  return <>{children}</>;
}
