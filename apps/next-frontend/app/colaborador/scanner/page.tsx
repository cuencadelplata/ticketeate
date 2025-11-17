'use client';

import { QRScanner } from '@/components/qr-scanner';
import { QRScannerFreeEvent } from '@/components/qr-scanner-free-event';
import { useRoleProtection } from '@/hooks/use-role-protection';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ScannerPage() {
  const { isProtected, isLoading: sessionLoading } = useRoleProtection(['COLABORADOR']);
  const router = useRouter();
  const [eventos, setEventos] = useState<any[]>([]);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cargar eventos del colaborador
  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/colaborador/mis-eventos');

      if (!response.ok) {
        console.error('Error loading eventos:', response.statusText);
        return;
      }

      const data = await response.json();
      console.log('📍 Eventos del colaborador:', data.eventos);
      setEventos(data.eventos || []);

      // Cargar info del primer evento
      if (data.eventos && data.eventos.length > 0) {
        setEventInfo(data.eventos[0]);
      }
    } catch (error) {
      console.error('Error loading eventos:', error);
      toast.error('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  // Detectar si el evento es gratis
  const isEventFree = eventInfo?.stock_entrada?.every((stock: any) => Number(stock.precio) === 0);

  // Hook se encarga de redirigir si el usuario no es COLABORADOR o cierra sesión
  // No mostrar nada si la sesión está cargando o el usuario no está protegido
  if (sessionLoading || !isProtected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // Verificar que el colaborador tiene un evento asignado
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!eventos || eventos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Sin Evento Asignado</h1>
          <p className="text-stone-400 mb-8">
            No tienes un evento asignado como colaborador. Por favor, contacta al organizador del
            evento.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-stone-700 hover:bg-stone-600 rounded-lg font-semibold transition-colors"
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
