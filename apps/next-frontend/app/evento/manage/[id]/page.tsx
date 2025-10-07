'use client';

import { notFound } from 'next/navigation';
import { getEventoById } from '@/lib/eventos';
import { Navbar } from '@/components/navbar';
import { ViewMetricsPanel } from '@/components/view-metrics-panel';
import { Calendar, MapPin, Users, Settings, Share2, BarChart3, Info, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useViewCount } from '@/hooks/use-view-count';

export default function ManageEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const [evento, setEvento] = useState<any>(null);
  const [id, setId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hook para obtener el conteo de views del evento actual
  const { viewCount } = useViewCount(id || undefined);

  useEffect(() => {
    const loadEvento = async () => {
      try {
        const resolvedParams = await params;
        setId(resolvedParams.id);
        const eventData = await getEventoById(resolvedParams.id);
        
        if (!eventData) {
          notFound();
          return;
        }
        
        setEvento(eventData);
      } catch (error) {
        console.error('Error loading evento:', error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    loadEvento();
  }, [params]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <div className="pb-4">
          <Navbar />
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">Cargando evento...</div>
        </div>
      </div>
    );
  }

  if (!evento) {
    return notFound();
  }

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="pb-4">
        <Navbar />
      </div>

      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header del evento */}
          <div className="mb-8 rounded-lg bg-[#1E1E1E] p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="mb-2 text-3xl font-bold">{evento.titulo}</h1>
                <div className="mb-4 flex flex-wrap items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>{formatDate(evento.fecha)}</span>
                  </div>
                  {evento.ubicacion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>{evento.ubicacion}</span>
                    </div>
                  )}
                  {evento.capacidad && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span>Capacidad: {evento.capacidad}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      evento.acceso === 'PUBLIC'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {evento.acceso === 'PUBLIC' ? 'Público' : 'Privado'}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      evento.tipoPrecio === 'FREE'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {evento.tipoPrecio === 'FREE' ? 'Gratis' : 'Pago'}
                  </span>
                </div>

                {evento.descripcion && <p className="mt-4 text-gray-300">{evento.descripcion}</p>}
              </div>

              {evento.imagen && (
                <div className="ml-6">
                  <img
                    src={evento.imagen}
                    alt={evento.titulo}
                    className="h-32 w-32 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Navegación de gestión */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href={`/event/manage/${id}/informacion`}
              className="group rounded-lg bg-[#1E1E1E] p-6 transition-colors hover:bg-[#2A2A2A]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/20 p-3">
                  <Info className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-blue-400">Información</h3>
                  <p className="text-sm text-gray-400">Editar detalles del evento</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/event/manage/${id}/invitados`}
              className="group rounded-lg bg-[#1E1E1E] p-6 transition-colors hover:bg-[#2A2A2A]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/20 p-3">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-green-400">Invitados</h3>
                  <p className="text-sm text-gray-400">Gestionar lista de invitados</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/event/manage/${id}/inscripcion`}
              className="group rounded-lg bg-[#1E1E1E] p-6 transition-colors hover:bg-[#2A2A2A]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/20 p-3">
                  <Settings className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-purple-400">Inscripción</h3>
                  <p className="text-sm text-gray-400">Configurar registro</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/event/manage/${id}/difusiones`}
              className="group rounded-lg bg-[#1E1E1E] p-6 transition-colors hover:bg-[#2A2A2A]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/20 p-3">
                  <Share2 className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-orange-400">Difusiones</h3>
                  <p className="text-sm text-gray-400">Promocionar evento</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/event/manage/${id}/mas`}
              className="group rounded-lg bg-[#1E1E1E] p-6 transition-colors hover:bg-[#2A2A2A]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-500/20 p-3">
                  <BarChart3 className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-red-400">Más opciones</h3>
                  <p className="text-sm text-gray-400">Configuración avanzada</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-[#1E1E1E] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Views</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {viewCount !== null ? viewCount.toLocaleString() : '0'}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="rounded-lg bg-[#1E1E1E] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Invitados</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <Users className="h-8 w-8 text-gray-500" />
              </div>
            </div>

            <div className="rounded-lg bg-[#1E1E1E] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Confirmados</p>
                  <p className="text-2xl font-bold text-green-400">0</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                  <span className="font-bold text-green-400">✓</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-[#1E1E1E] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-400">0</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20">
                  <span className="font-bold text-yellow-400">?</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de métricas de views */}
          <div className="mt-8">
            <div className="rounded-lg bg-[#1E1E1E] p-6">
              <ViewMetricsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
