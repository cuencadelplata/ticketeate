'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowRight, Plus, RefreshCw, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/use-auth';

type Event = {
  id: string;
  date: string;
  day: string;
  time: string;
  title: string;
  location?: string;
  hasLocation: boolean;
  guests: number;
  image?: string;
  isPast?: boolean;
  description?: string;
  access?: string;
  pricingType?: string;
  capacity?: number;
};

export default function EventosPage() {
  const [activeTab, setActiveTab] = useState<'proximos' | 'pasados'>('proximos');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  // Verificar auth
  const checkAuth = () => {
    if (!isAuthenticated && !authLoading) {
      toast.error('Acceso restringido', {
        description: 'Esta página es solo para productores. Por favor, inicia sesión.',
      });
      return false;
    }

    return isAuthenticated;
  };

  // events api
  const loadEvents = async () => {
    if (!checkAuth()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Error al cargar eventos');
      }
      const eventsData = await response.json();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Error al cargar los eventos');
      // fallback events if api fails
      setEvents(fallbackEvents);
    } finally {
      setLoading(false);
    }
  };

  // load events
  useEffect(() => {
    loadEvents();
  }, []);

  // fallback events
  const fallbackEvents: Event[] = [
    {
      id: '1',
      date: '16 mar',
      day: 'domingo',
      time: '19:00',
      title: 'Test',
      hasLocation: false,
      guests: 0,
      image:
        'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-mqGBYDqwMIJiPrNAPp8UVg0PAlolAM.png',
    },
    {
      id: '2',
      date: '24 feb',
      day: 'lunes',
      time: '2:00',
      title: 'test',
      location: 'Buenos Aires',
      hasLocation: true,
      guests: 0,
      image: '/placeholder.svg?height=100&width=100',
    },
    {
      id: '3',
      date: '10 ene',
      day: 'viernes',
      time: '20:30',
      title: 'Concierto',
      location: 'Teatro Municipal',
      hasLocation: true,
      guests: 120,
      image: '/placeholder.svg?height=100&width=100',
    },
  ];

  // filter events
  const filteredEvents = events.filter((event) => {
    const isPast = event.isPast ?? false;
    return activeTab === 'proximos' ? !isPast : isPast;
  });

  const hasEvents = filteredEvents.length > 0;

  // if not authenticated, show access restricted page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <div className="pb-4">
          <Navbar />
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 rounded-lg bg-[#2A2A2A] p-6">
            <Lock className="h-16 w-16 text-gray-500" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-gray-300">Acceso Restringido</h2>
          <p className="mb-8 max-w-md text-center text-gray-400">
            Esta página es exclusiva para productores. Inicia sesión para gestionar tus eventos.
          </p>
          <p className="text-sm text-gray-500">La autenticación se implementará próximamente.</p>
        </div>
      </div>
    );
  }

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
              {filteredEvents.map((event) => (
                <div key={event.id} className="relative">
                  <div className="absolute left-4 top-0 flex flex-col items-center">
                    <div className="text-lg font-medium">{event.date}</div>
                    <div className="text-sm text-gray-400">{event.day}</div>
                  </div>
                  <div className="absolute left-[4.5rem] top-[1.5rem] h-full w-0.5 bg-[#2A2A2A]"></div>
                  <div className="absolute left-[4.5rem] top-[1.5rem] h-2 w-2 rounded-full bg-gray-500"></div>

                  <div className="ml-20 flex justify-between rounded-lg bg-[#1E1E1E] p-4">
                    <div className="flex-1">
                      <div className="mb-1 text-sm text-gray-400">{event.time}</div>
                      <h3 className="mb-2 text-xl font-medium">{event.title}</h3>

                      {!event.hasLocation ? (
                        <div className="mb-1 flex items-center text-sm text-yellow-500">
                          <span className="mr-1">⚠️</span> Falta la ubicación
                        </div>
                      ) : (
                        <div className="mb-1 flex items-center text-sm text-gray-400">
                          <MapPin className="mr-1 h-4 w-4" /> {event.location}
                        </div>
                      )}

                      <div className="flex items-center text-sm text-gray-400">
                        <Users className="mr-1 h-4 w-4" />
                        {event.guests > 0 ? `${event.guests} invitados` : 'Sin invitados'}
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Link href={`/event/manage/${event.id}`}>
                          <button className="flex items-center gap-1 rounded bg-[#2A2A2A] px-3 py-1.5 text-sm transition-colors hover:bg-[#3A3A3A]">
                            Gestionar evento
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </Link>
                        {event.access && (
                          <span
                            className={cn(
                              'rounded px-2 py-1 text-xs',
                              event.access === 'PUBLIC'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400',
                            )}
                          >
                            {event.access === 'PUBLIC' ? 'Público' : 'Privado'}
                          </span>
                        )}
                        {event.pricingType && (
                          <span
                            className={cn(
                              'rounded px-2 py-1 text-xs',
                              event.pricingType === 'FREE'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-purple-500/20 text-purple-400',
                            )}
                          >
                            {event.pricingType === 'FREE' ? 'Gratis' : 'Pago'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <div className="h-24 w-24 overflow-hidden rounded">
                        {event.id === '1' ? (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-white p-1 text-center text-black">
                            <div className="text-xs">You</div>
                            <div className="font-serif text-lg">Are</div>
                            <div className="font-serif text-lg">Invited</div>
                          </div>
                        ) : (
                          <img
                            src={event.image || '/placeholder.svg'}
                            alt={event.title}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
