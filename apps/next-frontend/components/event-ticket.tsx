'use client';

import { useState } from 'react';
import { PencilLine, Ticket } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface EventTicketProps {
  onTicketChange: (ticketInfo: { type: 'free' | 'paid'; price?: number }) => void;
  onConnectWallet?: () => void;
}

export default function EventTicket({
  onTicketChange: _onTicketChange,
  onConnectWallet,
}: EventTicketProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConnectStripe = () => {
    onConnectWallet?.();
    setIsOpen(false);
    _onTicketChange?.({ type: 'free' });
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
            <span className="text-sm text-stone-400">Gratis</span>
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
      </DialogContent>
    </Dialog>
  );
}
