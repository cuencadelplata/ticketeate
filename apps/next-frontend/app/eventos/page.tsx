'use client';

import { useState } from 'react';
import {
  Calendar,
  MapPin,
  ArrowRight,
  Plus,
  RefreshCw,
  Trash2,
  Tag,
  Eye,
  EyeOff,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { toast } from 'sonner';

import { useEvents, useDeleteEvent } from '@/hooks/use-events';
import type { Event } from '@/types/events';

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
  return event.categoriaevento?.nombre || 'Sin categoría';
};

// Obtener imagen de portada
const getCoverImage = (event: Event) => {
  return (
    event.imagenes_evento?.find((img) => img.tipo === 'PORTADA')?.url ||
    event.imagenes_evento?.[0]?.url
  );
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
  return dateInfo.isPast;
};

export default function EventosPage() {
  const [activeTab, setActiveTab] = useState<'proximos' | 'pasados'>('proximos');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const { data: events = [], isLoading: loading, error, refetch } = useEvents();
  const deleteEventMutation = useDeleteEvent();

  //force reload
  const loadEvents = async () => {
    try {
      await refetch();
    } catch {
      console.error('Error loading events:', error);
      toast.error('Error al cargar los eventos');
    }
  };

  // filter events
  const proximosEvents = events.filter((event) => !isEventPast(event));
  const pasadosEvents = events.filter((event) => isEventPast(event));
  const filteredEvents = activeTab === 'proximos' ? proximosEvents : pasadosEvents;

  const hasEvents = filteredEvents.length > 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pb-4">
        <Navbar />
      </div>
      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header mejorado */}
          <div className="mb-12">
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
                        : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]',
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
                        : 'text-gray-400 hover:text-white hover:bg-[#2A2A2A]',
                    )}
                  >
                    Pasados ({pasadosEvents.length})
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={loadEvents}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#2A2A2A] px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-[#3A3A3A] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  title="Recargar eventos"
                >
                  <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                  {loading ? 'Cargando...' : 'Actualizar'}
                </button>
                <Link href="/crear">
                  <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:scale-105 shadow-lg">
                    <Plus className="h-4 w-4" />
                    Crear Evento
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <RefreshCw className="mb-4 h-16 w-16 animate-spin text-orange-500" />
                <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-orange-500/20"></div>
              </div>
              <p className="text-gray-400 text-lg">Cargando eventos...</p>
            </div>
          ) : !hasEvents ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-8 rounded-2xl bg-gradient-to-br from-[#2A2A2A] to-[#3A3A3A] p-8 border border-[#4A4A4A]">
                <Calendar className="h-20 w-20 text-gray-400 mx-auto" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-gray-200">
                Sin eventos {activeTab === 'proximos' ? 'próximos' : 'pasados'}
              </h2>
              <p className="mb-8 text-gray-400 text-lg text-center max-w-md">
                {activeTab === 'proximos'
                  ? 'No tienes eventos próximos. ¿Por qué no organizas uno?'
                  : 'No tienes eventos pasados.'}
              </p>
              {activeTab === 'proximos' && (
                <Link href="/crear">
                  <button className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-lg font-medium text-white transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:scale-105 shadow-xl">
                    <Plus className="h-5 w-5" />
                    <span>Crear mi primer evento</span>
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredEvents.map((event) => {
                const dateInfo = getEventDateInfo(event);
                const formattedDate =
                  dateInfo.hasEventDates && dateInfo.mainDate
                    ? formatEventDate(dateInfo.mainDate.toISOString())
                    : formatEventDate(
                        typeof event.fecha_creacion === 'string'
                          ? event.fecha_creacion
                          : event.fecha_creacion.toISOString(),
                      );
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
                                    : 'bg-red-500/20 border border-red-500/50'
                                }`}
                              >
                                <div
                                  className={`text-lg font-bold ${
                                    dateInfo.hasEventDates ? 'text-white' : 'text-red-400'
                                  }`}
                                >
                                  {dateInfo.hasEventDates ? formattedDate.date : 'Sin fecha'}
                                </div>
                                <div
                                  className={`text-xs ${
                                    dateInfo.hasEventDates ? 'text-gray-400' : 'text-red-300'
                                  }`}
                                >
                                  {dateInfo.hasEventDates ? formattedDate.day : 'Asignar fecha'}
                                </div>
                              </div>
                              {dateInfo.hasEventDates && (
                                <div className="text-sm text-gray-400">{formattedDate.time}</div>
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
                              <p className="text-gray-400 line-clamp-2">{event.descripcion}</p>
                            )}
                          </div>

                          {/* Información del evento */}
                          <div className="space-y-2">
                            {/* Ubicación */}
                            {hasLocation ? (
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span>{event.ubicacion}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-yellow-500">
                                <span>⚠️</span>
                                <span>Falta la ubicación</span>
                              </div>
                            )}

                            {/* Fechas principales */}
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>
                                {dateInfo.hasEventDates ? (
                                  <>
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
                                  new Date(event.fecha_creacion).toLocaleDateString('es-ES')
                                )}
                              </span>
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
                                        className="flex items-center gap-2 text-xs text-gray-400"
                                      >
                                        <Calendar className="h-3 w-3 text-gray-500" />
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
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <Users className="h-4 w-4 text-gray-500" />
                                <span>{event.stock_entrada?.length} tipo(s) de entrada</span>
                              </div>
                            )}
                          </div>

                          {/* Categoría */}
                          {category !== 'Sin categoría' && (
                            <div className="flex flex-wrap gap-2">
                              <span className="flex items-center gap-1 rounded-full bg-[#3A3A3A] px-2 py-1 text-xs text-gray-300">
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
                              onClick={async () => {
                                try {
                                  await deleteEventMutation.mutateAsync(event.eventoid);
                                  toast.success('Evento eliminado');
                                } catch (e: any) {
                                  toast.error(e?.message || 'Error al eliminar');
                                }
                              }}
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
                              <div className="flex h-full w-full flex-col items-center justify-center bg-[#2A2A2A] text-gray-400">
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
    </div>
  );
}
