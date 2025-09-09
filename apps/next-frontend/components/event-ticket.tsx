'use client';

import { useState } from 'react';
import { PencilLine, Ticket, Gift, CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWalletStatus } from '@/hooks/use-wallet';

interface EventTicketProps {
  onTicketChange: (ticketInfo: { type: 'free' | 'paid'; price?: number }) => void;
  onConnectWallet?: () => void;
  currentTicketInfo?: { type: 'free' | 'paid'; price?: number };
}

export default function EventTicket({
  onTicketChange: _onTicketChange,
  onConnectWallet,
  currentTicketInfo,
}: EventTicketProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: walletData } = useWalletStatus();
  const [type, setType] = useState<'free' | 'paid'>(currentTicketInfo?.type ?? 'free');

  const handleConnectStripe = () => {
    onConnectWallet?.();
    setIsOpen(false);
    _onTicketChange?.({ type: 'free' });
  };

  const handleSavePaid = () => {
    _onTicketChange?.(type === 'paid' ? { type: 'paid' } : { type: 'free' });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-md bg-stone-700 p-2 text-white transition-colors hover:bg-stone-500/50">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-stone-400" />
            <span className="text-sm font-medium text-stone-100">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-400">
              {currentTicketInfo?.type === 'paid' ? 'Pago' : 'Gratis'}
            </span>
            <PencilLine className="h-4 w-4 text-stone-400" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="border-0 bg-[#2A2A2A] sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-stone-700/50 p-2">
              <Ticket className="h-6 w-6 text-stone-300" />
            </div>
            <DialogTitle className="text-xl font-semibold text-stone-100">
              Aceptar pagos
            </DialogTitle>
          </div>
        </DialogHeader>
        {walletData?.wallet_linked ? (
          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType('free')}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  type === 'free'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-stone-700 bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-md p-2 ${type === 'free' ? 'bg-orange-500/20' : 'bg-stone-700'}`}
                  >
                    <Gift
                      className={`h-5 w-5 ${type === 'free' ? 'text-orange-400' : 'text-stone-300'}`}
                    />
                  </div>
                  <div>
                    <div
                      className={`text-base font-medium ${type === 'free' ? 'text-orange-400' : 'text-stone-100'}`}
                    >
                      Gratis
                    </div>
                    <div className="text-xs text-stone-400">Inscripciones sin costo</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setType('paid')}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  type === 'paid'
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-stone-700 bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-md p-2 ${type === 'paid' ? 'bg-orange-500/20' : 'bg-stone-700'}`}
                  >
                    <CreditCard
                      className={`h-5 w-5 ${type === 'paid' ? 'text-orange-400' : 'text-stone-300'}`}
                    />
                  </div>
                  <div>
                    <div
                      className={`text-base font-medium ${type === 'paid' ? 'text-orange-400' : 'text-stone-100'}`}
                    >
                      Pago
                    </div>
                    <div className="text-xs text-stone-400">Configura entradas pagas</div>
                  </div>
                </div>
              </button>
            </div>

            <Button
              onClick={handleSavePaid}
              className="w-full bg-white text-black hover:bg-stone-200"
            >
              Guardar
            </Button>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="space-y-4">
              <p className="text-sm text-stone-300">
                Este perfil aún no está configurado para aceptar pagos.
              </p>
              <p className="text-sm text-stone-400">
                Usamos <span className="text-stone-300">Mercado Pago</span> para procesar los pagos.
                Conecta o configura tu billetera para comenzar a aceptar pagos. Por lo general, toma
                menos de 5 minutos.
              </p>
            </div>

            <Button
              onClick={handleConnectStripe}
              className="w-full bg-white font-medium text-black hover:bg-stone-200"
            >
              Conectar Mercado Pago
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
