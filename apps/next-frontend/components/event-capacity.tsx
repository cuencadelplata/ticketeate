'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  ChevronLeft,
  PencilLine,
  Infinity as InfinityIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface TicketType {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  price: number;
  requiresApproval?: boolean;
  salesPeriod?: {
    start: string;
    end: string;
  };
}

interface EventCapacityProps {
  hasWallet: boolean;
  onCapacityChange: (capacity: {
    unlimited: boolean;
    limit?: number;
    ticketTypes?: TicketType[];
  }) => void;
}

type DialogView = 'main' | 'newTicket' | 'restrictions' | 'ticketTypes';

export default function EventCapacity({ hasWallet, onCapacityChange }: EventCapacityProps) {
  const [isUnlimited, setIsUnlimited] = useState(true);
  const [capacity, setCapacity] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DialogView>('main');
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [newTicket, setNewTicket] = useState<Partial<TicketType>>({
    name: '',
    description: '',
    capacity: 0,
    price: 0,
    requiresApproval: false,
  });

  const handleSave = () => {
    onCapacityChange({
      unlimited: isUnlimited,
      limit: !isUnlimited ? Number(capacity) : undefined,
      ticketTypes: hasWallet && ticketTypes.length > 0 ? ticketTypes : undefined,
    });
    setIsOpen(false);
    setCurrentView('main');
  };

  const addTicketType = () => {
    if (newTicket.name?.trim()) {
      const ticket: TicketType = {
        id: Date.now().toString(),
        name: newTicket.name,
        description: newTicket.description || '',
        capacity: newTicket.capacity || 0,
        price: newTicket.price || 0,
        requiresApproval: newTicket.requiresApproval || false,
      };
      setTicketTypes([...ticketTypes, ticket]);
      setNewTicket({
        name: '',
        description: '',
        capacity: 0,
        price: 0,
        requiresApproval: false,
      });
      setCurrentView('ticketTypes');
    }
  };

  const removeTicketType = (id: string) => {
    setTicketTypes(ticketTypes.filter(ticket => ticket.id !== id));
  };

  const updateTicketCapacity = (id: string, newCapacity: number) => {
    setTicketTypes(
      ticketTypes.map(ticket => (ticket.id === id ? { ...ticket, capacity: newCapacity } : ticket))
    );
  };

  // totalSpecificCapacity intentionally omitted as it's not used currently

  const renderBasicCapacityDialog = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-stone-100">Cupo máximo</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 pt-4">
        <p className="text-sm text-stone-400">
          Cerrar automáticamente la inscripción cuando se alcance el cupo. Solo los invitados
          aprobados cuentan para el límite.
        </p>

        <div className="space-y-4">
          <Label htmlFor="capacity" className="text-stone-100">
            Cupo
          </Label>
          <Input
            id="capacity"
            type="number"
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
            placeholder="50"
            className="border-0 bg-[#1A1A1A] text-stone-100 placeholder-stone-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setCapacity('');
              setIsUnlimited(true);
              handleSave();
            }}
            className="border-stone-600 bg-transparent text-stone-100 hover:bg-[#1A1A1A]"
          >
            <InfinityIcon className="mr-2 h-4 w-4" />
            Eliminar límite
          </Button>
        </div>
      </div>
    </>
  );

  const renderDialogContent = () => {
    if (!hasWallet) {
      return renderBasicCapacityDialog();
    }

    switch (currentView) {
      case 'main':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-stone-100">Tipos de entrada</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-4">
                {ticketTypes.map(ticket => (
                  <div key={ticket.id} className="flex items-center gap-4">
                    <Input
                      value={ticket.name}
                      onChange={e => {
                        setTicketTypes(
                          ticketTypes.map(t =>
                            t.id === ticket.id ? { ...t, name: e.target.value } : t
                          )
                        );
                      }}
                      className="border-0 bg-[#1A1A1A] text-stone-100"
                      placeholder="Nombre de la entrada"
                    />
                    <Input
                      type="number"
                      value={ticket.capacity}
                      onChange={e => updateTicketCapacity(ticket.id, Number(e.target.value))}
                      className="w-24 border-0 bg-[#1A1A1A] text-stone-100"
                      placeholder="Cupo"
                    />
                    <Input
                      type="number"
                      value={ticket.price}
                      onChange={e => {
                        setTicketTypes(
                          ticketTypes.map(t =>
                            t.id === ticket.id ? { ...t, price: Number(e.target.value) } : t
                          )
                        );
                      }}
                      className="w-24 border-0 bg-[#1A1A1A] text-stone-100"
                      placeholder="Precio"
                    />
                    <Button
                      variant="ghost"
                      onClick={() => removeTicketType(ticket.id)}
                      className="text-stone-400 hover:text-stone-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentView('newTicket')}
                className="w-full border-stone-600 bg-transparent text-stone-100 hover:bg-[#1A1A1A]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar tipo de entrada
              </Button>
            </div>
          </>
        );

      case 'newTicket':
        return (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentView('main')}
                  className="p-0 hover:bg-transparent"
                >
                  <ChevronLeft className="h-5 w-5 text-stone-100" />
                </Button>
                <DialogTitle className="text-stone-100">Nuevo tipo de entrada</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ticketName" className="text-stone-100">
                    Nombre de la entrada
                  </Label>
                  <Input
                    id="ticketName"
                    value={newTicket.name}
                    onChange={e => setNewTicket({ ...newTicket, name: e.target.value })}
                    placeholder="General"
                    className="border-0 bg-[#1A1A1A] text-stone-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticketDescription" className="text-stone-100">
                    Descripción
                  </Label>
                  <Textarea
                    id="ticketDescription"
                    value={newTicket.description}
                    onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Describe los beneficios o restricciones de este tipo de entrada"
                    className="min-h-[80px] border-0 bg-[#1A1A1A] text-stone-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticketCapacity" className="text-stone-100">
                      Cupo
                    </Label>
                    <Input
                      id="ticketCapacity"
                      type="number"
                      value={newTicket.capacity}
                      onChange={e =>
                        setNewTicket({ ...newTicket, capacity: Number(e.target.value) })
                      }
                      placeholder="100"
                      className="border-0 bg-[#1A1A1A] text-stone-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticketPrice" className="text-stone-100">
                      Precio
                    </Label>
                    <Input
                      id="ticketPrice"
                      type="number"
                      value={newTicket.price}
                      onChange={e => setNewTicket({ ...newTicket, price: Number(e.target.value) })}
                      placeholder="0"
                      className="border-0 bg-[#1A1A1A] text-stone-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="requiresApproval" className="text-stone-100">
                  Requiere aprobación
                </Label>
                <Switch
                  id="requiresApproval"
                  checked={newTicket.requiresApproval}
                  onCheckedChange={checked =>
                    setNewTicket({ ...newTicket, requiresApproval: checked })
                  }
                />
              </div>

              <Button
                onClick={addTicketType}
                disabled={!newTicket.name?.trim()}
                className="w-full bg-white text-black hover:bg-stone-200"
              >
                Crear tipo de entrada
              </Button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        setIsOpen(open);
        if (!open) {
          setCurrentView('main');
        }
      }}
    >
      <DialogTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-md bg-stone-700 p-2 text-white transition-colors hover:bg-stone-500/50">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-stone-400" />
            <span className="text-sm font-medium text-stone-100">Cupo máximo</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-400">{isUnlimited ? 'Ilimitado' : capacity}</span>
            <PencilLine className="h-4 w-4 text-stone-400" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="border-0 bg-[#2A2A2A] sm:max-w-[500px]">
        {renderDialogContent()}
        {(!hasWallet || currentView === 'main') && (
          <div className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-stone-600 bg-transparent text-stone-100 hover:bg-[#1A1A1A]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasWallet && !isUnlimited && !capacity}
              className="bg-white text-black hover:bg-stone-200"
            >
              Guardar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
