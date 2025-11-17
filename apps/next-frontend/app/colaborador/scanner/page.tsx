'use client';

import { QRScanner } from '@/components/qr-scanner';
import { QRScannerFreeEvent } from '@/components/qr-scanner-free-event';
import { InviteCodeModal } from '@/components/invite-code-modal';
import { useRoleProtection } from '@/hooks/use-role-protection';
import {
  useGetMyColaboradorEvents,
  useUseColaboradorInviteCode,
} from '@/hooks/use-colaborador-eventos';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ScannerPage() {
  const { isProtected, isLoading: sessionLoading } = useRoleProtection(['COLABORADOR']);
  const router = useRouter();
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  const {
    data: eventosData,
    isLoading: eventosLoading,
    error: eventosError,
  } = useGetMyColaboradorEvents();

  const useInviteCodeMutation = useUseColaboradorInviteCode();
  const eventos = eventosData ?? [];
  const eventInfo = eventos[0] ?? null;
  const isUsingCode = useInviteCodeMutation.isPending;
  const isEventosLoading = eventosLoading && !eventosData;

  useEffect(() => {
    if (eventosError instanceof Error) {
      toast.error(eventosError.message);
    }
  }, [eventosError]);

  const handleUseInviteCode = async () => {
    if (!inviteCodeInput.trim()) {
      toast.error('Por favor ingresa un código de invitación');
      return;
    }

    try {
      const data = await useInviteCodeMutation.mutateAsync(inviteCodeInput.trim());

      toast.success(data.message || '¡Código validado! Uniendo al evento...');
      setInviteCodeInput('');
      setShowCodeModal(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al validar código');
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
  if (isEventosLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!eventos || eventos.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Sin Evento Asignado</h1>
            <p className="text-stone-400 mb-8">
              No tienes un evento asignado como colaborador. Ingresa un código de invitación o
              contacta al organizador del evento.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowCodeModal(true)}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
              >
                Ingresar Código de Invitación
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-stone-700 hover:bg-stone-600 rounded-lg font-semibold transition-colors"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>

        <InviteCodeModal
          isOpen={showCodeModal}
          onClose={() => {
            setShowCodeModal(false);
            setInviteCodeInput('');
          }}
          onSubmit={handleUseInviteCode}
          codeValue={inviteCodeInput}
          onCodeChange={setInviteCodeInput}
          isLoading={isUsingCode}
        />
      </>
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
