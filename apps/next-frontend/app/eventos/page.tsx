'use client';

import { useState } from 'react';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Plus,
  Trash2,
  Tag,
  Eye,
  EyeOff,
  Users,
  ChevronDown,
  ChevronUp,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/navbar';
import { DeleteEventModal } from '@/components/delete-event-modal';
import { EditEventModal } from '@/components/edit-event-modal';
import Link from 'next/link';
import { toast } from 'sonner';
import { OrganizerGuard } from '@/components/organizer-guard';

import { useEvents, useDeleteEvent, useUpdateEvent } from '@/hooks/use-events';
import type { Event } from '@/types/events';

// Componente Skeleton personalizado con animación de barrido
const ShimmerSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`relative overflow-hidden rounded-md bg-stone-700 ${className}`} {...props}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-stone-600/50 to-transparent" />
  </div>
);

// Componente Skeleton solo para las cards de eventos
const EventsCardsSkeleton = () => (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A] border border-[#3A3A3A]"
      >
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-4">
              {/* Header skeleton */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShimmerSkeleton className="h-16 w-20 rounded-lg" />
                  <ShimmerSkeleton className="h-4 w-16" />
                </div>
                <ShimmerSkeleton className="h-6 w-20 rounded-full" />
              </div>

              {/* Title and description skeleton */}
              <div>
                <ShimmerSkeleton className="h-8 w-3/4 mb-2" />
                <ShimmerSkeleton className="h-4 w-full mb-2" />
                <ShimmerSkeleton className="h-4 w-2/3" />
              </div>

              {/* Category skeleton */}
              <ShimmerSkeleton className="h-6 w-24 rounded-full" />

              {/* Actions skeleton */}
              <div className="flex items-center gap-3 pt-2 pb-6">
                <ShimmerSkeleton className="h-10 w-32 rounded-lg" />
                <ShimmerSkeleton className="h-10 w-24 rounded-lg" />
              </div>
            </div>

            {/* Image skeleton */}
            <div className="ml-6">
              <ShimmerSkeleton className="h-32 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// formatear fecha
const formatEventDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  return {
    date: `${date.getDate()} ${months[date.getMonth()]}`,
    day: days[date.getDay()],
    time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
  };
};

// Obtener el estado actual del evento
const getEventStatus = (event: Event) => {
  const estadoActual = event.evento_estado?.[0]?.Estado;
  return estadoActual || 'OCULTO';
};

// Obtener categoría del evento
const getEventCategory = (event: Event) => {
  return event.evento_categorias?.[0]?.categoriaevento?.nombre || 'Sin categoría';
};

// Obtener imagen de portada
const getCoverImage = (event: Event) => {
  return (
    event.imagenes_evento?.find((img) => img.tipo === 'PORTADA')?.url ||
    event.imagenes_evento?.[0]?.url
  );
};

// Obtener información de modificaciones del evento
const getEventModifications = (event: Event) => {
  return event.evento_modificaciones || [];
};

// Formatear fecha de modificación
const formatModificationDate = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Obtener información detallada de fechas del evento
const getEventDateInfo = (event: Event) => {
  const fechasEvento = event.fechas_evento;

  if (!fechasEvento || fechasEvento.length === 0) {
    return {
      hasEventDates: false,
      mainDate: null,
      allDates: [],
      isPast: false,
      message: 'Sin fechas asignadas',
    };
  }

  // Procesar todas las fechas
  const allDates = fechasEvento.map((fecha, index) => {
    const fechaHora =
      typeof fecha.fecha_hora === 'string' ? new Date(fecha.fecha_hora) : fecha.fecha_hora;

    const fechaFin = fecha.fecha_fin
      ? typeof fecha.fecha_fin === 'string'
        ? new Date(fecha.fecha_fin)
        : fecha.fecha_fin
      : fechaHora;

    return {
      index,
      fechaHora,
      fechaFin,
      isPast: fechaFin < new Date(),
      formatted: formatEventDate(fechaHora.toISOString()),
    };
  });

  // La fecha principal es la primera
  const mainDate = allDates[0].fechaHora;
  const fechaFin = allDates[0].fechaFin;
  const isPast = fechaFin < new Date();

  return {
    hasEventDates: true,
    mainDate,
    allDates,
    isPast,
    message: isPast ? 'Evento pasado' : 'Evento próximo',
    hasMultipleDates: allDates.length > 1,
  };
};

// Determinar si un evento es pasado
const isEventPast = (event: Event) => {
  const dateInfo = getEventDateInfo(event);

  // Si tiene fechas del evento, usar la lógica existente
  if (dateInfo.hasEventDates) {
    return dateInfo.isPast;
  }

  // Si no tiene fechas del evento pero tiene fecha de publicación programada,
  // considerar el evento como "próximo" hasta que se publique
  if (event.fecha_publicacion) {
    const fechaPublicacion =
      typeof event.fecha_publicacion === 'string'
        ? new Date(event.fecha_publicacion)
        : event.fecha_publicacion;

    // Si la fecha de publicación es en el futuro, el evento es "próximo"
    return fechaPublicacion < new Date();
  }

  // Si no tiene ni fechas del evento ni fecha de publicación, usar fecha de creación
  const fechaCreacion = event.fecha_creacion
    ? typeof event.fecha_creacion === 'string'
      ? new Date(event.fecha_creacion)
      : event.fecha_creacion
    : new Date();

  return fechaCreacion < new Date();
};

export default function EventosPage() {
  const [activeTab, setActiveTab] = useState<'proximos' | 'pasados'>('proximos');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    eventId: string | null;
    eventTitle: string;
  }>({
    isOpen: false,
    eventId: null,
    eventTitle: '',
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    event: Event | null;
  }>({
    isOpen: false,
    event: null,
  });
  const { data: events = [], isLoading: loading } = useEvents();
  const deleteEventMutation = useDeleteEvent();
  const updateEventMutation = useUpdateEvent();

  // filter events
  const proximosEvents = events.filter((event) => !isEventPast(event));
  const pasadosEvents = events.filter((event) => isEventPast(event));
  const filteredEvents = activeTab === 'proximos' ? proximosEvents : pasadosEvents;

  const hasEvents = filteredEvents.length > 0;

  // Función para abrir el modal de confirmación
  const handleDeleteClick = (eventId: string, eventTitle: string) => {
    setDeleteModal({
      isOpen: true,
      eventId,
      eventTitle,
    });
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setDeleteModal({
      isOpen: false,
      eventId: null,
      eventTitle: '',
    });
  };

  // Función para confirmar la eliminación
  const handleConfirmDelete = async () => {
    if (!deleteModal.eventId) return;

    try {
      await deleteEventMutation.mutateAsync(deleteModal.eventId);
      toast.success('Evento eliminado correctamente');
      handleCloseModal();
    } catch (e: any) {
      toast.error(e?.message || 'Error al eliminar el evento');
    }
  };

  // Función para abrir el modal de edición
  const handleEditClick = (event: Event) => {
    setEditModal({
      isOpen: true,
      event,
    });
  };

  // Función para cerrar el modal de edición
  const handleCloseEditModal = () => {
    setEditModal({
      isOpen: false,
      event: null,
    });
  };

  // Función para guardar los cambios del evento
  const handleSaveEvent = async (eventData: Partial<Event>) => {
    if (!editModal.event) return;

    try {
      // Convertir los datos del evento al formato esperado por la API
      const updateData = {
        titulo: eventData.titulo,
        descripcion: eventData.descripcion,
        ubicacion: eventData.ubicacion,
        estado: eventData.evento_estado?.[0]?.Estado as
          | 'ACTIVO'
          | 'CANCELADO'
          | 'COMPLETADO'
          | 'OCULTO',
      };

      await updateEventMutation.mutateAsync({
        id: editModal.event.eventoid,
        eventData: updateData,
      });
      toast.success('Evento actualizado correctamente');
      handleCloseEditModal();
    } catch (e: any) {
      toast.error(e?.message || 'Error al actualizar el evento');
    }
  };

  return (
    <OrganizerGuard>
      <div className="min-h-screen bg-black text-white">
        <div className="pb-4">
          <Navbar />
        </div>
        <div className="p-6">
          <div className="mx-auto max-w-6xl">
            {/* Header mejorado */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex-1">
                  <h1 className="text-6xl font-instrument-serif font-light bg-gradient-to-r from-white to-stone-300 bg-clip-text text-transparent mb-2">
                    Mis Eventos
                  </h1>
                  <p className="text-stone-400 text-md">Gestiona y organiza todos tus eventos</p>
                </div>

                {/* Switch pequeño a la derecha */}
                <div className="flex items-center gap-3 px-4">
                  <div className="flex rounded-lg bg-[#1A1A1A] p-0.5 border border-[#3A3A3A]">
                    <button
                      onClick={() => setActiveTab('proximos')}
                      className={cn(
                        'rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
                        activeTab === 'proximos'
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'text-stone-400 hover:text-white hover:bg-[#2A2A2A]',
                      )}
                    >
                      Próximos ({proximosEvents.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('pasados')}
                      className={cn(
                        'rounded-md px-4 py-2 text-sm font-medium transition-all duration-200',
                        activeTab === 'pasados'
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'text-stone-400 hover:text-white hover:bg-[#2A2A2A]',
                      )}
                    >
                      Pasados ({pasadosEvents.length})
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Link href="/crear">
                    <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
                      <Plus className="h-4 w-4" />
                      Crear Evento
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {loading ? (
              <EventsCardsSkeleton />
            ) : !hasEvents ? (
              <div className="flex flex-col items-center justify-center py-12 pb-6">
                <div className="mb-8 rounded-2xl bg-gradient-to-br from-[#2A2A2A] to-[#3A3A3A] p-8 border border-[#4A4A4A]">
                  <Calendar className="h-20 w-20 text-stone-400 mx-auto" />
                </div>
                <h2 className="mb-4 text-3xl font-bold text-stone-200">
                  Sin eventos {activeTab === 'proximos' ? 'próximos' : 'pasados'}
                </h2>
                <p className="mb-8 text-stone-400 text-lg text-center max-w-md">
                  {activeTab === 'proximos' ? (
                    <>¿Por qué no organizas uno?</>
                  ) : (
                    'No tienes eventos pasados.'
                  )}
                </p>
                {activeTab === 'proximos' && (
                  <Link href="/crear">
                    <button className="flex items-center gap-3 rounded-md bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-md font-medium text-white transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:scale-105 shadow-xl">
                      <Plus className="h-4 w-4" />
                      <span>Crear mi primer evento</span>
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6 pb-8">
                {filteredEvents.map((event) => {
                  const dateInfo = getEventDateInfo(event);

                  // Determinar qué fecha mostrar en el header
                  let headerDate: Date;
                  if (dateInfo.hasEventDates && dateInfo.mainDate) {
                    // Si tiene fechas del evento, mostrar la fecha del evento
                    headerDate = dateInfo.mainDate;
                  } else if (event.fecha_publicacion) {
                    // Si no tiene fechas del evento pero tiene fecha de publicación, mostrar esa fecha
                    headerDate =
                      typeof event.fecha_publicacion === 'string'
                        ? new Date(event.fecha_publicacion)
                        : event.fecha_publicacion;
                  } else {
                    // Como último recurso, usar fecha de creación
                    headerDate = event.fecha_creacion
                      ? typeof event.fecha_creacion === 'string'
                        ? new Date(event.fecha_creacion)
                        : event.fecha_creacion
                      : new Date();
                  }

                  const formattedDate = formatEventDate(headerDate.toISOString());

                  // Determinar fecha de visibilidad
                  const visibilityDate = event.fecha_publicacion
                    ? typeof event.fecha_publicacion === 'string'
                      ? new Date(event.fecha_publicacion)
                      : event.fecha_publicacion
                    : event.fecha_creacion
                      ? typeof event.fecha_creacion === 'string'
                        ? new Date(event.fecha_creacion)
                        : event.fecha_creacion
                      : new Date();
                  const hasLocation = !!event.ubicacion;
                  const coverImage = getCoverImage(event);
                  const eventStatus = getEventStatus(event);
                  const category = getEventCategory(event);
                  const hasTickets = event.stock_entrada && event.stock_entrada.length > 0;

                  return (
                    <div
                      key={event.eventoid}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A] border border-[#3A3A3A] transition-all duration-300 hover:border-[#4A4A4A] hover:shadow-xl"
                    >
                      {/* Imagen de fondo con overlay */}
                      {coverImage && (
                        <div className="absolute inset-0 opacity-10">
                          <img
                            src={coverImage}
                            alt={event.titulo}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="relative p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-4">
                            {/* Header con fecha y estado */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex flex-col items-center rounded-lg px-3 py-2 ${
                                    dateInfo.hasEventDates
                                      ? 'bg-[#3A3A3A]'
                                      : event.fecha_publicacion
                                        ? 'bg-blue-500/20 border border-blue-500/50'
                                        : 'bg-red-500/20 border border-red-500/50'
                                  }`}
                                >
                                  <div
                                    className={`text-lg font-bold ${
                                      dateInfo.hasEventDates
                                        ? 'text-white'
                                        : event.fecha_publicacion
                                          ? 'text-blue-400'
                                          : 'text-red-400'
                                    }`}
                                  >
                                    {dateInfo.hasEventDates
                                      ? formattedDate.date
                                      : event.fecha_publicacion
                                        ? formattedDate.date
                                        : 'Sin fecha'}
                                  </div>
                                  <div
                                    className={`text-xs ${
                                      dateInfo.hasEventDates
                                        ? 'text-stone-400'
                                        : event.fecha_publicacion
                                          ? 'text-blue-300'
                                          : 'text-red-300'
                                    }`}
                                  >
                                    {dateInfo.hasEventDates
                                      ? formattedDate.day
                                      : event.fecha_publicacion
                                        ? 'Programado'
                                        : 'Asignar fecha'}
                                  </div>
                                </div>
                                {(dateInfo.hasEventDates || event.fecha_publicacion) && (
                                  <div className="text-sm text-stone-400">{formattedDate.time}</div>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                                    eventStatus === 'ACTIVO'
                                      ? 'bg-green-500/20 text-green-400'
                                      : eventStatus === 'CANCELADO'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-yellow-500/20 text-yellow-400',
                                  )}
                                >
                                  {eventStatus === 'ACTIVO' ? (
                                    <Eye className="h-3 w-3" />
                                  ) : (
                                    <EyeOff className="h-3 w-3" />
                                  )}
                                  {eventStatus === 'ACTIVO'
                                    ? 'Activo'
                                    : eventStatus === 'CANCELADO'
                                      ? 'Cancelado'
                                      : 'Oculto'}
                                </span>
                              </div>
                            </div>

                            {/* Título y descripción */}
                            <div>
                              <h3 className="mb-2 text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                                {event.titulo}
                              </h3>
                              {event.descripcion && (
                                <p className="text-stone-400 line-clamp-2">{event.descripcion}</p>
                              )}
                            </div>

                            {/* Información del evento */}
                            <div className="space-y-2">
                              {/* Ubicación */}
                              {hasLocation ? (
                                <div className="flex items-center gap-2 text-sm text-stone-300">
                                  <MapPin className="h-4 w-4 text-stone-500" />
                                  <span>{event.ubicacion}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-sm text-yellow-500">
                                  <span>⚠️</span>
                                  <span>Falta la ubicación</span>
                                </div>
                              )}

                              {/* Fechas principales */}
                              <div className="space-y-1">
                                {/* Fecha del evento */}
                                <div className="flex items-center gap-2 text-sm text-stone-300">
                                  <Calendar className="h-4 w-4 text-stone-500" />
                                  <span>
                                    {dateInfo.hasEventDates ? (
                                      <>
                                        <span className="font-medium">Evento:</span>{' '}
                                        {dateInfo.mainDate?.toLocaleDateString('es-ES')}
                                        {dateInfo.allDates[0]?.fechaFin &&
                                          dateInfo.allDates[0].fechaFin.getTime() !==
                                            dateInfo.mainDate?.getTime() && (
                                            <>
                                              {' '}
                                              -{' '}
                                              {dateInfo.allDates[0].fechaFin.toLocaleDateString(
                                                'es-ES',
                                              )}
                                            </>
                                          )}
                                        {dateInfo.hasMultipleDates && (
                                          <span className="ml-2 text-orange-400">
                                            +{dateInfo.allDates.length - 1} fecha
                                            {dateInfo.allDates.length - 1 > 1 ? 's' : ''} más
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-yellow-500">
                                        Sin fecha de evento asignada
                                      </span>
                                    )}
                                  </span>
                                </div>

                                {/* Fecha de visibilidad */}
                                <div className="flex items-center gap-2 text-sm text-stone-400">
                                  <Eye className="h-4 w-4 text-stone-500" />
                                  <span>
                                    <span className="font-medium">Visible desde:</span>{' '}
                                    {visibilityDate.toLocaleDateString('es-ES')} a las{' '}
                                    {visibilityDate.toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Fechas adicionales (expandible) */}
                              {dateInfo.hasMultipleDates && (
                                <div className="ml-6">
                                  <button
                                    onClick={() => {
                                      const newExpanded = new Set(expandedDates);
                                      if (newExpanded.has(event.eventoid)) {
                                        newExpanded.delete(event.eventoid);
                                      } else {
                                        newExpanded.add(event.eventoid);
                                      }
                                      setExpandedDates(newExpanded);
                                    }}
                                    className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                                  >
                                    {expandedDates.has(event.eventoid) ? (
                                      <ChevronUp className="h-3 w-3" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3" />
                                    )}
                                    <span>
                                      {expandedDates.has(event.eventoid)
                                        ? 'Ocultar fechas adicionales'
                                        : `Ver ${dateInfo.allDates.length - 1} fecha${dateInfo.allDates.length - 1 > 1 ? 's' : ''} adicional${dateInfo.allDates.length - 1 > 1 ? 'es' : ''}`}
                                    </span>
                                  </button>

                                  {expandedDates.has(event.eventoid) && (
                                    <div className="mt-2 space-y-1">
                                      {dateInfo.allDates.slice(1).map((fecha, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 text-xs text-stone-400"
                                        >
                                          <Calendar className="h-3 w-3 text-stone-500" />
                                          <span>
                                            {fecha.fechaHora.toLocaleDateString('es-ES')} a las{' '}
                                            {fecha.formatted.time}
                                            {fecha.fechaFin &&
                                              fecha.fechaFin.getTime() !==
                                                fecha.fechaHora.getTime() && (
                                                <> - {fecha.fechaFin.toLocaleDateString('es-ES')}</>
                                              )}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Tickets */}
                              {hasTickets && (
                                <div className="flex items-center gap-2 text-sm text-stone-300">
                                  <Users className="h-4 w-4 text-stone-500" />
                                  <span>{event.stock_entrada?.length} tipo(s) de entrada</span>
                                </div>
                              )}

                              {/* Modificaciones recientes */}
                              {getEventModifications(event).length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-blue-300">
                                  <Edit3 className="h-4 w-4 text-blue-500" />
                                  <span>
                                    Última modificación:{' '}
                                    {formatModificationDate(
                                      getEventModifications(event)[0].fecha_modificacion,
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Categoría */}
                            {category !== 'Sin categoría' && (
                              <div className="flex flex-wrap gap-2">
                                <span className="flex items-center gap-1 rounded-full bg-[#3A3A3A] px-2 py-1 text-xs text-stone-300">
                                  <Tag className="h-3 w-3" />
                                  {category}
                                </span>
                              </div>
                            )}

                            {/* Acciones */}
                            <div className="flex items-center gap-3 pt-2">
                              <Link href={`/evento/manage/${event.eventoid}`}>
                                <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
                                  Gestionar evento
                                  <ArrowRight className="h-4 w-4" />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleEditClick(event)}
                                className="flex items-center gap-2 rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/30"
                              >
                                <Edit3 className="h-4 w-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteClick(event.eventoid, event.titulo)}
                                className="flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </button>
                            </div>
                          </div>

                          {/* Imagen del evento */}
                          <div className="ml-6">
                            <div className="h-32 w-32 overflow-hidden rounded-lg border border-[#3A3A3A]">
                              {coverImage ? (
                                <img
                                  src={coverImage}
                                  alt={event.titulo}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center bg-[#2A2A2A] text-stone-400">
                                  <Calendar className="mb-2 h-8 w-8" />
                                  <div className="text-xs">Sin imagen</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmación para eliminar evento */}
        <DeleteEventModal
          isOpen={deleteModal.isOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmDelete}
          eventTitle={deleteModal.eventTitle}
          isLoading={deleteEventMutation.isPending}
        />

        {/* Modal de edición de evento */}
        <EditEventModal
          isOpen={editModal.isOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveEvent}
          event={editModal.event}
          isLoading={updateEventMutation.isPending}
        />
      </div>
    </OrganizerGuard>
  );
}
