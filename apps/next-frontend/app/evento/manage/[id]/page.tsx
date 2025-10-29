'use client';

import { notFound } from 'next/navigation';
import { useEvent } from '@/hooks/use-events';
import { Navbar } from '@/components/navbar';
import { Calendar, MapPin, Users, Settings, BarChart3, Info, Eye } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useViewCount } from '@/hooks/use-view-count';
import { ViewsChart } from '@/components/views-chart';
import { use } from 'react';

// Componente Skeleton personalizado con animación de barrido
const ShimmerSkeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`relative overflow-hidden rounded-md bg-stone-700 ${className}`} {...props}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-stone-600/50 to-transparent" />
  </div>
);

// Componente Skeleton para la página de gestión
const ManageEventSkeleton = () => (
  <div className="min-h-screen bg-[#121212] text-white">
    <div className="pb-4">
      <Navbar />
    </div>
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header skeleton */}
        <div className="mb-8 rounded-lg bg-[#1E1E1E] p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <ShimmerSkeleton className="h-8 w-3/4 mb-2" />
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <ShimmerSkeleton className="h-5 w-48" />
                <ShimmerSkeleton className="h-5 w-32" />
                <ShimmerSkeleton className="h-5 w-24" />
              </div>
              <div className="flex gap-2 mb-4">
                <ShimmerSkeleton className="h-6 w-16" />
                <ShimmerSkeleton className="h-6 w-16" />
                <ShimmerSkeleton className="h-6 w-20" />
              </div>
              <ShimmerSkeleton className="h-4 w-full" />
              <ShimmerSkeleton className="h-4 w-2/3 mt-2" />
            </div>
            <div className="ml-6">
              <ShimmerSkeleton className="h-32 w-32 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Navigation cards skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-[#1E1E1E] p-6">
              <div className="flex items-center gap-3">
                <ShimmerSkeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <ShimmerSkeleton className="h-5 w-24 mb-2" />
                  <ShimmerSkeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats skeleton */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-[#1E1E1E] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <ShimmerSkeleton className="h-4 w-20 mb-2" />
                  <ShimmerSkeleton className="h-8 w-16" />
                </div>
                <ShimmerSkeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="mt-8 rounded-lg bg-[#1E1E1E] p-6">
          <ShimmerSkeleton className="h-6 w-32 mb-4" />
          <ShimmerSkeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  </div>
);

export default function ManageEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Hook para obtener el evento usando TanStack Query
  const { data: evento, isLoading, error } = useEvent(id);

  // Hook para obtener el conteo de views del evento actual
  const {
    data: viewCountData,
    isLoading: isLoadingViews,
    error: viewCountError,
  } = useViewCount(id);

  // Manejar errores
  if (error) {
    console.error('Error loading evento:', error);
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        <div className="pb-4">
          <Navbar />
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-400 mb-4">Error al cargar el evento</div>
            <div className="text-stone-400 text-sm">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ManageEventSkeleton />;
  }

  if (!evento) {
    return notFound();
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Sin fecha';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  // Helper functions para obtener datos del evento
  const getEventDate = () => {
    return evento?.fechas_evento?.[0]?.fecha_hora || evento?.fecha_creacion;
  };

  const getEventImage = () => {
    return evento?.imagenes_evento?.find((img) => img.tipo === 'PORTADA')?.url;
  };

  const getEventStatus = () => {
    return evento?.evento_estado?.[0]?.Estado || 'OCULTO';
  };

  const isEventPublic = () => {
    const status = getEventStatus();
    return status === 'ACTIVO' || status === 'COMPLETADO';
  };

  const isEventFree = () => {
    return (
      !evento?.stock_entrada ||
      evento.stock_entrada.length === 0 ||
      evento.stock_entrada.every((stock) => Number(stock.precio) === 0)
    );
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
                    <span>{formatDate(getEventDate())}</span>
                  </div>
                  {evento.ubicacion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>{evento.ubicacion}</span>
                    </div>
                  )}
                  {evento.stock_entrada && evento.stock_entrada.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span>
                        Capacidad:{' '}
                        {evento.stock_entrada.reduce((total, stock) => total + stock.cant_max, 0)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      isEventPublic()
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {isEventPublic() ? 'Público' : 'Privado'}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      isEventFree()
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {isEventFree() ? 'Gratis' : 'Pago'}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      getEventStatus() === 'ACTIVO'
                        ? 'bg-green-500/20 text-green-400'
                        : getEventStatus() === 'CANCELADO'
                          ? 'bg-red-500/20 text-red-400'
                          : getEventStatus() === 'COMPLETADO'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-stone-500/20 text-stone-400'
                    }`}
                  >
                    {getEventStatus()}
                  </span>
                </div>

                {evento.descripcion && <p className="mt-4 text-stone-300">{evento.descripcion}</p>}
              </div>

              {getEventImage() && (
                <div className="ml-6">
                  <img
                    src={getEventImage()}
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
              href={`/evento/manage/${id}/informacion`}
              className="group rounded-lg bg-[#1E1E1E] p-6 transition-colors hover:bg-[#2A2A2A]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-500/20 p-3">
                  <Info className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-orange-400">Información</h3>
                  <p className="text-sm text-gray-400">Editar detalles del evento</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/evento/manage/${id}/invitados`}
              className="group rounded-lg bg-[#1E1E1E] p-6 transition-colors hover:bg-[#2A2A2A]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-600/20 p-3">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-orange-500">Invitados</h3>
                  <p className="text-sm text-stone-400">Gestionar lista de invitados</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/evento/manage/${id}/inscripcion`}
              className="group rounded-lg bg-[#1E1E1E] p-6 transition-colors hover:bg-[#2A2A2A]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-700/20 p-3">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-orange-600">Inscripción</h3>
                  <p className="text-sm text-stone-400">Configurar registro</p>
                </div>
              </div>
            </Link>

            <Link
              href={`/evento/manage/${id}/mas`}
              className="group rounded-lg bg-[#1E1E1E] p-6 transition-colors hover:bg-[#2A2A2A]"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-800/20 p-3">
                  <BarChart3 className="h-6 w-6 text-orange-700" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-orange-700">Más opciones</h3>
                  <p className="text-sm text-stone-400">Configuración avanzada</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Estadísticas rápidas */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-[#1E1E1E] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-400">Total Views</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {isLoadingViews ? (
                      <span className="text-stone-400">Cargando...</span>
                    ) : viewCountError ? (
                      <span className="text-red-400">Error</span>
                    ) : (
                      (viewCountData?.views || 0).toLocaleString()
                    )}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-orange-500" />
              </div>
            </div>

            <div className="rounded-lg bg-[#1E1E1E] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-400">Total Invitados</p>
                  <p className="text-2xl font-bold text-orange-500">0</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </div>

            <div className="rounded-lg bg-[#1E1E1E] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-400">Confirmados</p>
                  <p className="text-2xl font-bold text-orange-600">0</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-600/20">
                  <span className="font-bold text-orange-600">✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico de views */}
          <div className="mt-8">
            <ViewsChart eventId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
