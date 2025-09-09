'use client';

import { useState } from 'react';
import { Calendar, MapPin, ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { toast } from 'sonner';

import { useEvents } from '@/hooks/use-events';
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

// Determinar si un evento es pasado
const isEventPast = (fechaFin: string) => {
  return new Date(fechaFin) < new Date();
};

export default function EventosPage() {
  const [activeTab, setActiveTab] = useState<'proximos' | 'pasados'>('proximos');
  const { data: events = [], isLoading: loading, error, refetch } = useEvents();

  //force reload
  const loadEvents = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Error al cargar los eventos');
    }
  };

  // filter events
  const filteredEvents = events.filter((event) => {
    const isPast = isEventPast(event.fecha_fin_venta);
    return activeTab === 'proximos' ? !isPast : isPast;
  });

  const hasEvents = filteredEvents.length > 0;

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="pb-4">
        <Navbar />
      </div>
      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold">Eventos</h1>
              <button
                onClick={loadEvents}
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-[#2A2A2A] px-3 py-2 text-sm transition-colors hover:bg-[#3A3A3A] disabled:opacity-50"
                title="Recargar eventos"
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>
            <div className="flex rounded-lg bg-[#2A2A2A]">
              <button
                onClick={() => setActiveTab('proximos')}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm',
                  activeTab === 'proximos' ? 'bg-[#3A3A3A] text-white' : 'text-gray-400',
                )}
              >
                Próximos
              </button>
              <button
                onClick={() => setActiveTab('pasados')}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm',
                  activeTab === 'pasados' ? 'bg-[#3A3A3A] text-white' : 'text-gray-400',
                )}
              >
                Pasados
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCw className="mb-4 h-16 w-16 animate-spin text-gray-500" />
              <p className="text-gray-400">Cargando eventos...</p>
            </div>
          ) : !hasEvents ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-6 rounded-lg bg-[#2A2A2A] p-6">
                <Calendar className="h-16 w-16 text-gray-500" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-300">
                Sin eventos {activeTab === 'proximos' ? 'próximos' : 'pasados'}
              </h2>
              <p className="mb-8 text-gray-400">
                {activeTab === 'proximos'
                  ? 'No tienes eventos próximos. ¿Por qué no organizas uno?'
                  : 'No tienes eventos pasados.'}
              </p>
              {activeTab === 'proximos' && (
                <Link href="/crear" className="flex">
                  <button className="flex items-center gap-2 rounded-md bg-[#2A2A2A] px-4 py-2 transition-colors hover:bg-[#3A3A3A]">
                    <Plus className="h-5 w-5" />
                    <span>Crear evento</span>
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {filteredEvents.map((event) => {
                const formattedDate = formatEventDate(event.fecha_inicio_venta);
                const hasLocation = !!event.ubicacion;
                const coverImage =
                  event.imagenes_evento?.find((img) => img.tipo === 'portada')?.url ||
                  event.imagenes_evento?.[0]?.url;

                return (
                  <div key={event.id_evento} className="relative">
                    <div className="absolute left-4 top-0 flex flex-col items-center">
                      <div className="text-lg font-medium">{formattedDate.date}</div>
                      <div className="text-sm text-gray-400">{formattedDate.day}</div>
                    </div>
                    <div className="absolute left-[4.5rem] top-[1.5rem] h-full w-0.5 bg-[#2A2A2A]"></div>
                    <div className="absolute left-[4.5rem] top-[1.5rem] h-2 w-2 rounded-full bg-gray-500"></div>

                    <div className="ml-20 flex justify-between rounded-lg bg-[#1E1E1E] p-4">
                      <div className="flex-1">
                        <div className="mb-1 text-sm text-gray-400">{formattedDate.time}</div>
                        <h3 className="mb-2 text-xl font-medium">{event.titulo}</h3>

                        {!hasLocation ? (
                          <div className="mb-1 flex items-center text-sm text-yellow-500">
                            <span className="mr-1">⚠️</span> Falta la ubicación
                          </div>
                        ) : (
                          <div className="mb-1 flex items-center text-sm text-gray-400">
                            <MapPin className="mr-1 h-4 w-4" /> {event.ubicacion}
                          </div>
                        )}

                        <div className="mb-1 text-sm text-gray-400">
                          <span className="mr-1">📅</span>
                          {new Date(event.fecha_inicio_venta).toLocaleDateString('es-ES')} -{' '}
                          {new Date(event.fecha_fin_venta).toLocaleDateString('es-ES')}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <Link href={`/evento/manage/${event.id_evento}`}>
                            <button className="flex items-center gap-1 rounded bg-[#2A2A2A] px-3 py-1.5 text-sm transition-colors hover:bg-[#3A3A3A]">
                              Gestionar evento
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </Link>
                          <span
                            className={cn(
                              'rounded px-2 py-1 text-xs',
                              event.estado === 'ACTIVO'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400',
                            )}
                          >
                            {event.estado === 'ACTIVO' ? 'Activo' : 'Oculto'}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4">
                        <div className="h-24 w-24 overflow-hidden rounded">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={event.titulo}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-[#2A2A2A] p-1 text-center text-gray-400">
                              <Calendar className="mb-1 h-8 w-8" />
                              <div className="text-xs">Sin imagen</div>
                            </div>
                          )}
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