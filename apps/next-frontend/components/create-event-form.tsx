'use client';

import { useState, useMemo, useEffect } from 'react';
import { Globe, Upload, ChevronDown, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from '@/components/ui/dialog';

import { Navbar } from './navbar';
import { Lock } from 'lucide-react';

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import React from 'react';

import UploadImageModal from './UploadImageModal';
import { DateSelect } from './date-select';
import { TimeSelect } from './time-select';
import EventLocation, { EventLocationData } from './event-location';
import EventTicket from './event-ticket';
import EventCapacity from './event-capacity';
import EventDescription from './event-description';
import { useLoadScript } from '@react-google-maps/api';
import { toast } from 'sonner';
import { useCreateEvent } from '@/hooks/use-events';
import { useAuth } from '@clerk/nextjs';

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

const visibilityOptions = {
  public: {
    label: 'Público',
    description: 'Se muestra en tu calendario y es elegible para ser destacado.',
    icon: <Globe className="h-7 w-7" />,
  },
  private: {
    label: 'Privado',
    description: 'No listado. Solo las personas con el enlace pueden inscribirse.',
    icon: <Lock className="h-7 w-7" />,
  },
};

export default function CreateEventForm() {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [selected, setSelected] = useState<'public' | 'private'>('public');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');

  const libraries = useMemo(() => ['places'], []);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries as any,
  });

  const [location, setLocation] = useState<EventLocationData | null>(null);

  // Date formatter intentionally not used in this component

  const [description, setDescription] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ticketInfo, setTicketInfo] = useState<{
    type: 'free' | 'paid';
    price?: number;
  }>({ type: 'free' });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [capacityInfo, setCapacityInfo] = useState<{
    unlimited: boolean;
    limit?: number;
  }>({ unlimited: true });

  function handleCapacityChange(capacity: {
    unlimited: boolean;
    limit?: number | undefined;
    ticketTypes?: TicketType[] | undefined;
  }): void {
    setCapacityInfo({
      unlimited: capacity.unlimited,
      limit: capacity.limit,
    });
  }

  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Hook de TanStack Query para crear eventos
  const createEventMutation = useCreateEvent();
  const { isSignedIn } = useAuth();

  // check auth
  useEffect(() => {
    const checkAuthAndShowModal = () => {
      try {
        setHasCheckedAuth(true);
      } catch (error) {
        console.error('Error checking auth:', error);
        setHasCheckedAuth(true);
      }
    };

    checkAuthAndShowModal();
  }, [hasCheckedAuth]);

  const handleCreateEvent = async () => {
    // Validar autenticación
    if (!isSignedIn) {
      toast.error('Debes iniciar sesión para crear eventos');
      return;
    }

    // Validaciones
    if (!eventName.trim()) {
      toast.error('Por favor ingresa un nombre para el evento');
      return;
    }

    if (!location) {
      toast.error('Por favor selecciona una ubicación para el evento');
      return;
    }

    if (!description.trim()) {
      toast.error('Por favor agrega una descripción del evento');
      return;
    }

    // Combinar fecha y hora
    const startDateTime = new Date(startDate);
    const [startHour, startMinute] = startTime.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

    const endDateTime = new Date(endDate);
    const [endHour, endMinute] = endTime.split(':');
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

    const eventData = {
      titulo: eventName,
      fecha_inicio_venta: startDateTime.toISOString(),
      fecha_fin_venta: endDateTime.toISOString(),
      estado: selected === 'public' ? 'activo' : 'oculto',
      ubicacion: location.address,
      descripcion: description,
      imageUrl: coverImage || undefined,
    };

    // Usar TanStack Query para crear el evento
    createEventMutation.mutate(eventData, {
      onSuccess: event => {
        // Mostrar mensaje de éxito
        toast.success('¡Evento creado exitosamente!', {
          description: `${event.titulo} ha sido creado y está listo para compartir.`,
        });

        // Limpiar formulario
        setEventName('');
        setDescription('');
        setCoverImage(null);
        setLocation(null);
        setStartDate(new Date());
        setEndDate(new Date());
        setStartTime('00:00');
        setEndTime('00:00');
      },
      onError: error => {
        toast.error(error.message || 'Error al crear el evento');
      },
    });
  };

  if (!isLoaded) {
    // En este caso, simplemente no renderizamos el EventLocation
    return null;
  }

  return (
    <>
      {coverImage ? (
        <div
          style={{ backgroundImage: `url(${coverImage})` }}
          className="fixed left-0 top-0 z-10 h-full w-full bg-cover bg-center opacity-30 blur-lg filter"
        />
      ) : (
        <div className="fixed left-0 top-0 z-10 h-full w-full bg-gradient-to-b from-neutral-950 to-neutral-900" />
      )}

      <div className="relative z-20 min-h-screen overflow-hidden text-zinc-200 transition-all duration-500">
        <Navbar />

        <div className="mx-auto max-w-5xl space-y-2 px-20 pt-10">
          <div className="grid gap-8 md:grid-cols-[330px,1fr]">
            <div className="space-y-2">
              <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogTrigger asChild>
                  <Card
                    style={
                      coverImage
                        ? {
                            backgroundImage: `url(${coverImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : {}
                    }
                    className={`cursor-pointer rounded-xl bg-stone-900 backdrop-blur-lg transition-all duration-300 ${
                      coverImage ? 'h-80' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      {!coverImage && (
                        <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-400/50 bg-stone-800/30 transition-all duration-200 hover:border-blue-500/50 hover:bg-stone-800/50">
                          <Upload className="h-8 w-8 text-stone-200 transition-colors duration-200" />
                          <p className="mt-2 text-sm text-stone-500">Subir imagen del evento</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Subir imagen del evento</DialogTitle>
                  </DialogHeader>
                  <UploadImageModal
                    onSelectImage={img => {
                      setCoverImage(img);
                      setIsImageDialogOpen(false);
                    }}
                    onClose={() => setIsImageDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Nombre del evento"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  className="w-full border-none bg-transparent text-3xl font-normal text-stone-100 placeholder-stone-200 outline-none focus:ring-0"
                />

                <Dropdown placement="bottom-end" className="bg-stone-900">
                  <DropdownTrigger asChild>
                    <Button
                      size="sm"
                      className="rounded-md !bg-stone-700 !bg-opacity-60 p-2 px-2 text-sm transition-colors hover:bg-stone-800/50"
                      color="primary"
                      variant="faded"
                    >
                      {visibilityOptions[selected].icon}
                      {visibilityOptions[selected].label}
                      <ChevronDown className="h-7 w-7" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    selectionMode="single"
                    selectedKeys={new Set([selected])}
                    onSelectionChange={keys => {
                      const selection = Array.from(keys as Set<string>);
                      if (selection.length > 0) {
                        setSelected(selection[0] as 'public' | 'private');
                      }
                    }}
                    style={{ width: '300px', maxHeight: '350px' }}
                    className="bg-stone-900 p-0"
                  >
                    {Object.entries(visibilityOptions).map(
                      ([key, { label, description, icon }], index) => (
                        <DropdownItem
                          key={key}
                          className={`!rounded-md !border-0 bg-stone-900 px-3 py-3 transition-colors hover:bg-stone-800 ${
                            index > 0 ? 'mt-1' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            {icon &&
                              React.cloneElement(icon, {
                                className: 'w-4 h-4 mr-2 flex-shrink-0 self-center',
                              })}
                            <div className="flex flex-col">
                              <span className="font-medium">{label}</span>
                              <span className="text-sm leading-tight text-stone-400">
                                {description}
                              </span>
                            </div>
                          </div>
                        </DropdownItem>
                      )
                    )}
                  </DropdownMenu>
                </Dropdown>
              </div>

              <div className="space-y-1 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2 pl-4">
                <div className="relative flex items-center gap-4">
                  <div className="flex w-14 items-center gap-2 text-zinc-400">
                    <Circle className="h-2 w-2 fill-current" />
                    <span className="text-sm text-white">Inicio</span>
                  </div>
                  <div className="flex gap-1">
                    <DateSelect value={startDate} onChange={date => date && setStartDate(date)} />
                    <TimeSelect value={startTime} onChange={setStartTime} />
                  </div>
                </div>
                <div className="relative flex items-center gap-4">
                  <div className="flex w-14 items-center gap-2 text-zinc-400">
                    <Circle className="h-2 w-2 fill-current" />
                    <span className="text-sm text-white">Fin</span>
                  </div>
                  <div className="flex gap-1">
                    <DateSelect value={endDate} onChange={date => date && setEndDate(date)} />
                    <TimeSelect value={endTime} onChange={setEndTime} />
                  </div>
                </div>
              </div>

              <EventLocation onLocationSelect={loc => setLocation(loc)} />
              <EventDescription onDescriptionChange={setDescription} />

              <Card className="border-1 bg-stone-900 bg-opacity-60">
                <CardContent className="space-y-1 p-2">
                  <h3 className="pb-1 text-sm font-semibold text-stone-200">Opciones del evento</h3>

                  <div className="flex items-center justify-between">
                    <EventTicket onTicketChange={setTicketInfo} />
                  </div>

                  <div className="flex items-center justify-between">
                    <EventCapacity hasWallet={false} onCapacityChange={handleCapacityChange} />
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleCreateEvent}
                size="md"
                className="w-full rounded-lg bg-white py-3 text-base font-medium text-black shadow-lg hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? 'Creando evento...' : 'Crear evento'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
