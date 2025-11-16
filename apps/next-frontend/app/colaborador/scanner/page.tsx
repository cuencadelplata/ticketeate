'use client';

import { QRScanner } from '@/components/qr-scanner';
import { QRScannerFreeEvent } from '@/components/qr-scanner-free-event';
import { useGetMyEvent } from '@/hooks/use-invite-codes';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { prisma } from '@repo/db';

export default function ScannerPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: eventos, isLoading: loadingEventos } = useGetMyEvent();
  const router = useRouter();
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [loadingEventInfo, setLoadingEventInfo] = useState(false);

  // Cargar información del evento para detectar si es gratis
  useEffect(() => {
    if (eventos && eventos.length > 0) {
      const eventoid = eventos[0]?.eventoid;
      loadEventInfo(eventoid);
    }
  }, [eventos]);

  const loadEventInfo = async (eventoid: string) => {
    try {
      setLoadingEventInfo(true);
      const response = await fetch(`/api/eventos?id=${eventoid}`);
      if (response.ok) {
        const data = await response.json();
        setEventInfo(data.event);
      }
    } catch (error) {
      console.error('Error loading event info:', error);
    } finally {
      setLoadingEventInfo(false);
    }
  };

  // Detectar si el evento es gratis
  const isEventFree = eventInfo?.stock_entrada?.every((stock: any) => Number(stock.precio) === 0);

  // Proteger ruta: solo colaboradores
  if (!sessionLoading && session?.user?.role !== 'COLABORADOR') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1>
          <p className="text-stone-400 mb-8">Solo colaboradores pueden acceder a esta sección</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (sessionLoading || loadingEventos || loadingEventInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // Verificar que el colaborador tiene un evento asignado
  if (!eventos || eventos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Sin Evento Asignado</h1>
          <p className="text-stone-400 mb-8">
            No tienes un evento asignado. Solicita un código de invitación a un organizador.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Usar el primer evento asignado (normalmente un colaborador tendrá uno)
  const eventoid = eventos[0]?.eventoid;

  // Si es un evento gratis, usar el scanner de eventos gratis
  if (isEventFree) {
    return <QRScannerFreeEvent eventoid={eventoid} />;
  }

  // Si es un evento de pago, usar el scanner original
  return <QRScanner eventoid={eventoid} />;
}
