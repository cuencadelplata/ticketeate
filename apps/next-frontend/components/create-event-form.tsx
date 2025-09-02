'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Globe,
  Upload,
  ChevronDown,
  Circle,
  Plus,
  Calendar,
  Trash,
  GripVertical,
} from 'lucide-react';
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
import type { CreateEventData } from '@/types/events';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface EventDate {
  id: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  isMain: boolean;
}

interface SortableImageProps {
  image: string;
  index: number;
  onRemove: (index: number) => void;
}

function SortableImage({ image, index, onRemove }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div className="aspect-square overflow-hidden rounded-lg">
        <img src={image} alt={`Imagen ${index + 1}`} className="h-full w-full object-cover" />
      </div>
      <div className="absolute left-2 top-2">
        <div
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            index === 0 ? 'bg-orange-500 text-white' : 'bg-black/50 text-white'
          }`}
        >
          {index === 0 ? 'Portada' : index + 1}
        </div>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
      >
        <Trash className="h-3 w-3" />
      </button>
      <button
        {...attributes}
        {...listeners}
        className="absolute bottom-2 left-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
      >
        <GripVertical className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function CreateEventForm() {
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [selected, setSelected] = useState<'public' | 'private'>('public');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const libraries = useMemo(() => ['places'], []);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: libraries as any,
  });

  const [location, setLocation] = useState<EventLocationData | null>(null);

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

  const [eventDates, setEventDates] = useState<EventDate[]>([
    {
      id: Date.now().toString(),
      startDate: new Date(),
      endDate: new Date(),
      startTime: '00:00',
      endTime: '00:00',
      isMain: true,
    },
  ]);

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

  const addEventDate = () => {
    const newDate: EventDate = {
      id: Date.now().toString(),
      startDate: new Date(),
      endDate: new Date(),
      startTime: '00:00',
      endTime: '00:00',
      isMain: false,
    };
    setEventDates([...eventDates, newDate]);
  };

  const removeEventDate = (id: string) => {
    if (eventDates.length > 1) {
      const updatedDates = eventDates.filter(date => date.id !== id);
      if (updatedDates.length > 0 && !updatedDates.some(date => date.isMain)) {
        updatedDates[0].isMain = true;
      }
      setEventDates(updatedDates);
    }
  };

  const updateEventDate = (id: string, updates: Partial<EventDate>) => {
    setEventDates(prevDates =>
      prevDates.map(date => (date.id === id ? { ...date, ...updates } : date))
    );
  };

  const setMainDate = (id: string) => {
    setEventDates(prevDates =>
      prevDates.map(date => ({
        ...date,
        isMain: date.id === id,
      }))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEventImages(items => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const createEventMutation = useCreateEvent();
  const { isSignedIn } = useAuth();

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
    if (!isSignedIn) {
      toast.error('Debes iniciar sesión para crear eventos');
      return;
    }

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

    if (eventDates.length === 0) {
      toast.error('Debes agregar al menos una fecha para el evento');
      return;
    }

    const mainDate = eventDates.find(date => date.isMain) || eventDates[0];

    const startDateTime = new Date(mainDate.startDate);
    const [startHour, startMinute] = mainDate.startTime.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

    const endDateTime = new Date(mainDate.endDate);
    const [endHour, endMinute] = mainDate.endTime.split(':');
    endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

    const eventData: CreateEventData = {
      titulo: eventName,
      fecha_inicio_venta: startDateTime.toISOString(),
      fecha_fin_venta: endDateTime.toISOString(),
      estado: selected === 'public' ? 'ACTIVO' : 'OCULTO',
      ubicacion: location.address,
      descripcion: description,
      imageUrl: eventImages.length > 0 ? eventImages[0] : undefined,
      galeria_imagenes: eventImages.length > 1 ? eventImages.slice(1) : undefined,
      fechas_adicionales: eventDates
        .filter(date => !date.isMain)
        .map(date => ({
          fecha_inicio: new Date(
            date.startDate.getTime() +
              (parseInt(date.startTime.split(':')[0]) * 60 +
                parseInt(date.startTime.split(':')[1])) *
                60000
          ).toISOString(),
          fecha_fin: new Date(
            date.endDate.getTime() +
              (parseInt(date.endTime.split(':')[0]) * 60 + parseInt(date.endTime.split(':')[1])) *
                60000
          ).toISOString(),
        })),
      eventMap: location.eventMap,
    };

    createEventMutation.mutate(eventData, {
      onSuccess: event => {
        toast.success('¡Evento creado exitosamente!', {
          description: `${event.titulo} ha sido creado y está listo para compartir.`,
        });

        setEventName('');
        setDescription('');
        setEventImages([]);
        setLocation(null);
        setEventDates([
          {
            id: Date.now().toString(),
            startDate: new Date(),
            endDate: new Date(),
            startTime: '00:00',
            endTime: '00:00',
            isMain: true,
          },
        ]);
      },
      onError: error => {
        toast.error(error.message || 'Error al crear el evento');
      },
    });
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <>
      {eventImages.length > 0 ? (
        <div
          style={{ backgroundImage: `url(${eventImages[0]})` }}
          className="fixed left-0 top-0 z-10 h-full w-full bg-cover bg-center opacity-30 blur-lg filter"
        />
      ) : (
        <div className="fixed left-0 top-0 z-10 h-full w-full bg-gradient-to-b from-neutral-950 to-neutral-900" />
      )}

      <div className="relative z-20 min-h-screen overflow-hidden text-zinc-200 transition-all duration-500">
        <Navbar />

        <div className="mx-auto max-w-5xl space-y-2 px-20 pb-3 pt-10">
          <div className="grid gap-8 md:grid-cols-[330px,1fr]">
            <div className="space-y-2">
              <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                <DialogTrigger asChild>
                  <Card
                    style={
                      eventImages.length > 0
                        ? {
                            backgroundImage: `url(${eventImages[0]})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : {}
                    }
                    className={`cursor-pointer rounded-xl bg-stone-900 backdrop-blur-lg transition-all duration-300 ${
                      eventImages.length > 0 ? 'h-80' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      {eventImages.length === 0 && (
                        <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-400/50 bg-stone-800/30 transition-all duration-200 hover:border-orange-500/50 hover:bg-stone-800/50">
                          <Upload className="h-8 w-8 text-stone-200 transition-colors duration-200" />
                          <p className="mt-2 text-sm text-stone-500">Subir imágenes del evento</p>
                          <p className="text-xs text-stone-600">Máximo 4 imágenes</p>
                        </div>
                      )}
                      {eventImages.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-black/50 px-3 py-1 text-sm text-white">
                            {eventImages.length}/4 imágenes
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Galería de imágenes del evento</DialogTitle>
                  </DialogHeader>
                  <UploadImageModal
                    onSelectImage={img => {
                      if (eventImages.length < 4) {
                        setEventImages(prev => [...prev, img]);
                      } else {
                        toast.error('Máximo 4 imágenes permitidas');
                      }
                    }}
                    onClose={() => setIsImageDialogOpen(false)}
                    maxImages={4}
                    currentImages={eventImages.length}
                  />
                </DialogContent>
              </Dialog>

              {eventImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-stone-200">Galería de imágenes</h3>
                    <span className="text-xs text-stone-400">
                      {eventImages.length}/4 - La primera es la portada
                    </span>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={eventImages} strategy={verticalListSortingStrategy}>
                      <div className="grid grid-cols-2 gap-2">
                        {eventImages.map((image, index) => (
                          <SortableImage
                            key={image}
                            image={image}
                            index={index}
                            onRemove={index => {
                              setEventImages(prev => prev.filter((_, i) => i !== index));
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  <p className="text-xs text-stone-500">
                    💡 Arrastra las imágenes para reordenarlas. La primera imagen será la portada
                    del evento.
                  </p>
                </div>
              )}
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

              <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
                <div className="flex items-center gap-2 pb-1">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  <h3 className="text-sm font-semibold text-stone-200">Fechas del evento</h3>
                </div>

                {eventDates.map((eventDate, index) => (
                  <div
                    key={eventDate.id}
                    className={`relative rounded-md border-1 p-2 ${
                      eventDate.isMain
                        ? 'border-orange-500/50 bg-orange-500/10'
                        : 'border-stone-700/50 bg-stone-800/30'
                    }`}
                  >
                    {eventDates.length > 1 && (
                      <button
                        onClick={() => removeEventDate(eventDate.id)}
                        className="absolute -right-1 -top-1 rounded-full border border-stone-600 bg-stone-800 p-1 text-stone-400 transition-colors hover:bg-stone-700 hover:text-stone-200"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    )}

                    <div className="space-y-1 pl-1">
                      <div className="flex items-center gap-1">
                        <div className="flex w-16 flex-shrink-0 items-center gap-2 text-zinc-400">
                          <Circle className="h-2 w-2 fill-current" />
                          <span className="text-xs text-white">Inicio</span>
                        </div>
                        <div className="flex flex-1 gap-1">
                          <DateSelect
                            value={eventDate.startDate}
                            onChange={date =>
                              date && updateEventDate(eventDate.id, { startDate: date })
                            }
                          />
                          <TimeSelect
                            value={eventDate.startTime}
                            onChange={time => updateEventDate(eventDate.id, { startTime: time })}
                          />
                        </div>
                        <div className="w-20 flex-shrink-0" />
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex w-16 flex-shrink-0 items-center gap-2 text-zinc-400">
                          <Circle className="h-2 w-2 fill-current" />
                          <span className="text-xs text-white">Fin</span>
                        </div>

                        <div className="flex flex-1 gap-1">
                          <DateSelect
                            value={eventDate.endDate}
                            onChange={date =>
                              date && updateEventDate(eventDate.id, { endDate: date })
                            }
                          />
                          <TimeSelect
                            value={eventDate.endTime}
                            onChange={time => updateEventDate(eventDate.id, { endTime: time })}
                          />
                        </div>

                        <Button
                          size="sm"
                          onClick={addEventDate}
                          className="flex-shrink-0 rounded-md !bg-stone-700 !bg-opacity-60 px-2 py-1 text-xs transition-colors hover:bg-stone-800/50"
                          color="primary"
                          variant="faded"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>

                        <div className="flex flex-shrink-0 items-center gap-1">
                          <button
                            onClick={() => setMainDate(eventDate.id)}
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                              eventDate.isMain
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-stone-500 hover:border-stone-400'
                            }`}
                          >
                            {eventDate.isMain && (
                              <Circle className="h-2.5 w-2.5 fill-white text-white" />
                            )}
                          </button>
                          <span className="text-xs text-stone-400">
                            {eventDate.isMain ? 'Fecha principal' : 'Marcar como principal'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <EventLocation onLocationSelect={loc => setLocation(loc)} />
              <EventDescription
                onDescriptionChange={setDescription}
                eventTitle={eventName}
                eventType="Evento"
              />

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
