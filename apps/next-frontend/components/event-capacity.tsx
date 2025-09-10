'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  ChevronLeft,
  PencilLine,
  Infinity as InfinityIcon,
  Clock,
  ShoppingCart,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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

interface QueueConfig {
  enabled: boolean;
  maxSimultaneousPurchases: number;
  purchaseTimeLimit: number; // en minutos
}

interface EventCapacityProps {
  hasWallet: boolean;
  onCapacityChange: (capacity: {
    unlimited: boolean;
    limit?: number;
    ticketTypes?: TicketType[];
    queueConfig?: QueueConfig;
  }) => void;
}

type DialogView = 'main' | 'newTicket' | 'restrictions' | 'ticketTypes' | 'queueSettings';

export default function EventCapacity({ hasWallet, onCapacityChange }: EventCapacityProps) {
  const [isUnlimited, setIsUnlimited] = useState(true);
  const [capacity, setCapacity] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DialogView>('main');
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [queueConfig, setQueueConfig] = useState<QueueConfig>({
    enabled: false,
    maxSimultaneousPurchases: 10,
    purchaseTimeLimit: 15,
  });
  const [newTicket, setNewTicket] = useState<Partial<TicketType>>({
    name: '',
    description: '',
    capacity: 0,
    price: 0,
    requiresApproval: false,
  });

  // Sincronizar estados de capacidad
  useEffect(() => {
    if (capacity && capacity !== '') {
      setIsUnlimited(false);
    } else {
      setIsUnlimited(true);
    }
  }, [capacity]);

  const handleSave = () => {
    onCapacityChange({
      unlimited: isUnlimited,
      limit: !isUnlimited ? Number(capacity) : undefined,
      ticketTypes: hasWallet && ticketTypes.length > 0 ? ticketTypes : undefined,
      queueConfig: queueConfig.enabled ? queueConfig : undefined,
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
    setTicketTypes(ticketTypes.filter((ticket) => ticket.id !== id));
  };

  const updateTicketCapacity = (id: string, newCapacity: number) => {
    setTicketTypes(
      ticketTypes.map((ticket) =>
        ticket.id === id ? { ...ticket, capacity: newCapacity } : ticket,
      ),
    );
  };

  const _renderBasicCapacityDialog = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-stone-100">Cupo máximo</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 pt-2">
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
            onChange={(e) => setCapacity(e.target.value)}
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

  const renderQueueSettings = () => (
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
          <DialogTitle className="text-stone-100">Configuración de cola</DialogTitle>
        </div>
      </DialogHeader>
      <div className="space-y-3 pt-2">
        <Card className="border-stone-600 bg-[#1A1A1A]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-stone-400" />
                <CardTitle className="text-base text-stone-100">Sistema de cola</CardTitle>
              </div>
              <Switch
                checked={queueConfig.enabled}
                onCheckedChange={(checked) => setQueueConfig({ ...queueConfig, enabled: checked })}
              />
            </div>
            <CardDescription className="text-stone-400">
              Controla cuántas personas pueden comprar entradas simultáneamente
            </CardDescription>
          </CardHeader>
          {queueConfig.enabled && (
            <CardContent className="space-y-4 pt-0">
              <Separator className="bg-stone-600" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxSimultaneous" className="text-sm text-stone-100">
                    Compradores simultáneos
                  </Label>
                  <Input
                    id="maxSimultaneous"
                    type="number"
                    min="1"
                    value={queueConfig.maxSimultaneousPurchases}
                    onChange={(e) =>
                      setQueueConfig({
                        ...queueConfig,
                        maxSimultaneousPurchases: Number(e.target.value),
                      })
                    }
                    className="border-stone-600 bg-[#2A2A2A] text-stone-100"
                    placeholder="10"
                  />
                  <p className="text-xs text-stone-500">
                    Máximo de personas comprando al mismo tiempo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLimit" className="text-sm text-stone-100">
                    Tiempo límite (min)
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={queueConfig.purchaseTimeLimit}
                    onChange={(e) =>
                      setQueueConfig({
                        ...queueConfig,
                        purchaseTimeLimit: Number(e.target.value),
                      })
                    }
                    className="border-stone-600 bg-[#2A2A2A] text-stone-100"
                    placeholder="15"
                  />
                  <p className="text-xs text-stone-500">Tiempo para completar la compra</p>
                </div>
              </div>

              <div className="rounded-lg bg-stone-800/50 p-3">
                <div className="flex items-center gap-2 text-sm text-stone-300">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Resumen de la cola:</span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-stone-400">
                  <p>• Máximo {queueConfig.maxSimultaneousPurchases} compradores simultáneos</p>
                  <p>• Tiempo límite: {queueConfig.purchaseTimeLimit} minutos por compra</p>
                  <p>• Los usuarios esperarán en cola cuando se alcance el límite</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );

  const renderDialogContent = () => {
    switch (currentView) {
      case 'main':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-stone-100">Configuración del evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 pt-2">
              {/* Configuración de cupo máximo */}
              <Card className="border-stone-600 bg-[#1A1A1A]">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-stone-400" />
                    <CardTitle className="text-base text-stone-100">Cupo máximo</CardTitle>
                  </div>
                  <CardDescription className="text-stone-400">
                    Cerrar automáticamente la inscripción cuando se alcance el cupo
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="text-sm text-stone-100">
                        Cantidad de entradas disponibles
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder="50"
                        className="border-0 bg-[#2A2A2A] text-stone-100"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCapacity('');
                          setIsUnlimited(true);
                        }}
                        className="border-stone-600 bg-transparent text-stone-100 hover:bg-[#2A2A2A]"
                      >
                        <InfinityIcon className="mr-2 h-4 w-4" />
                        {isUnlimited ? 'Ilimitado' : 'Eliminar límite'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuración de cola - SIEMPRE visible */}
              <Card className="border-stone-600 bg-[#1A1A1A]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-stone-400" />
                      <CardTitle className="text-base text-stone-100">Sistema de cola</CardTitle>
                    </div>
                    <Switch
                      checked={queueConfig.enabled}
                      onCheckedChange={(checked) =>
                        setQueueConfig({ ...queueConfig, enabled: checked })
                      }
                    />
                  </div>
                  <CardDescription className="text-stone-400">
                    Controla el acceso simultáneo a la compra de entradas
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {queueConfig.enabled ? (
                    <>
                      <Separator className="mb-3 bg-stone-600" />
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-stone-300">
                          <p>
                            Máximo {queueConfig.maxSimultaneousPurchases} compradores simultáneos
                          </p>
                          <p className="text-stone-400">
                            Tiempo límite: {queueConfig.purchaseTimeLimit} min
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentView('queueSettings')}
                          className="border-stone-600 bg-transparent text-stone-100 hover:bg-[#2A2A2A]"
                        >
                          <PencilLine className="mr-2 h-3 w-3" />
                          Editar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center">
                      <Clock className="mx-auto mb-2 h-6 w-6 text-stone-500" />
                      <p className="mb-3 text-sm text-stone-400">
                        El sistema de cola está desactivado
                      </p>
                      <p className="text-xs text-stone-500">
                        Activa el switch para configurar cuántas personas pueden comprar
                        simultáneamente
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tipos de entrada - solo si tiene wallet */}
              {hasWallet && (
                <Card className="border-stone-600 bg-[#1A1A1A]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-stone-100">Tipos de entrada</CardTitle>
                    <CardDescription className="text-stone-400">
                      Configura diferentes tipos de entradas con precios y capacidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    {ticketTypes.length > 0 ? (
                      <div className="space-y-3">
                        {ticketTypes.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex items-center gap-1 rounded-lg bg-[#2A2A2A] p-3"
                          >
                            <div className="flex-1 space-y-2">
                              <Input
                                value={ticket.name}
                                onChange={(e) => {
                                  setTicketTypes(
                                    ticketTypes.map((t) =>
                                      t.id === ticket.id ? { ...t, name: e.target.value } : t,
                                    ),
                                  );
                                }}
                                className="border-0 bg-transparent text-sm text-stone-100"
                                placeholder="Nombre de la entrada"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={ticket.capacity}
                                  onChange={(e) =>
                                    updateTicketCapacity(ticket.id, Number(e.target.value))
                                  }
                                  className="w-20 border-0 bg-transparent text-sm text-stone-100"
                                  placeholder="Cupo"
                                />
                                <Input
                                  type="number"
                                  value={ticket.price}
                                  onChange={(e) => {
                                    setTicketTypes(
                                      ticketTypes.map((t) =>
                                        t.id === ticket.id
                                          ? { ...t, price: Number(e.target.value) }
                                          : t,
                                      ),
                                    );
                                  }}
                                  className="w-20 border-0 bg-transparent text-sm text-stone-100"
                                  placeholder="Precio"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTicketType(ticket.id)}
                              className="text-stone-400 hover:text-stone-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center">
                        <Users className="mx-auto mb-2 h-8 w-8 text-stone-500" />
                        <p className="text-sm text-stone-400">
                          No hay tipos de entrada configurados
                        </p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => setCurrentView('newTicket')}
                      className="w-full border-stone-600 bg-transparent text-stone-100 hover:bg-[#2A2A2A]"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar tipo de entrada
                    </Button>
                  </CardContent>
                </Card>
              )}
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
                    onChange={(e) => setNewTicket({ ...newTicket, name: e.target.value })}
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
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
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
                      onChange={(e) =>
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
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, price: Number(e.target.value) })
                      }
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
                  onCheckedChange={(checked) =>
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

      case 'queueSettings':
        return renderQueueSettings();

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-stone-100">Cupo máximo</span>
              {queueConfig.enabled && (
                <Badge variant="secondary" className="bg-stone-600 text-xs text-stone-300">
                  <Clock className="mr-1 h-3 w-3" />
                  Cola activa
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-400">{isUnlimited ? 'Ilimitado' : capacity}</span>
            <PencilLine className="h-4 w-4 text-stone-400" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto border-0 bg-[#2A2A2A] sm:max-w-[600px]">
        {renderDialogContent()}
        {(currentView === 'main' || currentView === 'queueSettings') && (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-stone-600 bg-transparent text-stone-100 hover:bg-[#1A2A2A]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isUnlimited && !capacity}
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
