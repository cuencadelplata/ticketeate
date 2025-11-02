'use client';

import { useRouter } from 'next/navigation';
import { useReservation } from '@/hooks/use-reservation';
import { useViewCount, useCountView } from '@/hooks/use-view-count';
import { useSession } from '@/lib/auth-client';
import { Calendar, Eye, Clock } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';
import Image from 'next/image';
import { QueueModal } from '@/components/queue-modal';
import type { Event } from '@/types/events';

interface EventoContentProps {
  event: Event;
  eventId?: string;
}

// Helper function para formatear fechas de manera elegante
const formatEventDate = (date: Date) => {
  const now = new Date();
  const eventDate = new Date(date);
  const isToday = eventDate.toDateString() === now.toDateString();
  const isTomorrow =
    eventDate.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();

  const dayName = eventDate.toLocaleDateString('es-AR', { weekday: 'long' });
  const dayNumber = eventDate.getDate();
  const monthName = eventDate.toLocaleDateString('es-AR', { month: 'long' });
  const year = eventDate.getFullYear();
  const time = eventDate.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return {
    isToday,
    isTomorrow,
    dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
    dayNumber,
    monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
    year,
    time,
    fullDate: `${dayName}, ${dayNumber} de ${monthName} de ${year}`,
    shortDate: `${dayNumber}/${eventDate.getMonth() + 1}/${year}`,
  };
};

export function EventoContent({ event, eventId }: EventoContentProps) {
  const router = useRouter();
  const id = eventId;
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [displayAddress, setDisplayAddress] = useState<string | null>(null);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showExpiredMessage, setShowExpiredMessage] = useState(false);

  // Obtener userId de la sesión de Better-Auth
  const { data: session } = useSession();
  const userId = session?.user?.id || '';

  // Guardar userId en sessionStorage para que QueueGuard pueda acceder
  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
      sessionStorage.setItem('queueUserId', userId);
    }
  }, [userId]);

  // Detectar si viene del checkout con tiempo expirado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('expired') === 'true') {
        setShowExpiredMessage(true);
        // Limpiar el parámetro de la URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => setShowExpiredMessage(false), 5000);
      }
    }
  }, []);

  // Hook para manejar reserva temporal
  const { isReserved, timeLeft, startReservation, formatTimeLeft, isReservationActive } =
    useReservation();

  // Hook para manejar conteo de views
  const { data: viewCountData, isLoading: isLoadingViews } = useViewCount(id);
  const countViewMutation = useCountView();

  // Ref para controlar si ya se registró la view (evita re-renders)
  const hasRegisteredViewRef = useRef<string | null>(null);

  // Registrar view automáticamente cuando se carga la página - SOLO UNA VEZ
  useEffect(() => {
    if (id && event && hasRegisteredViewRef.current !== id) {
      hasRegisteredViewRef.current = id;

      // Usar setTimeout para evitar problemas de timing
      const timeoutId = setTimeout(() => {
        countViewMutation.mutate(id, {
          onError: (error) => {
            console.error('Error registering view:', error);
            // En caso de error, permitir reintentar después de un tiempo
            setTimeout(() => {
              if (hasRegisteredViewRef.current === id) {
                hasRegisteredViewRef.current = null;
              }
            }, 5000);
          },
        });
      }, 100); // Pequeño delay para evitar problemas de timing

      return () => clearTimeout(timeoutId);
    }
  }, [id, event, countViewMutation]); // Agregamos countViewMutation a las dependencias

  // Función para manejar el clic en "Comprar Entradas"
  const handleComprarEntradas = async () => {
    if (!id) return;

    // Verificar que el usuario esté autenticado
    if (!userId) {
      console.error('[EventoContent] User not authenticated');
      alert('Debes iniciar sesión para comprar entradas');
      return;
    }

    try {
      console.log('[EventoContent] Attempting to join queue for event:', id, 'user:', userId);

      // Intentar unirse a la cola directamente (el backend decide si puede entrar)
      const joinResponse = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, userId }),
      });

      if (!joinResponse.ok) {
        console.error('[EventoContent] Failed to join queue, showing modal');
        setShowQueueModal(true);
        return;
      }

      const joinData = await joinResponse.json();
      console.log('[EventoContent] Join queue response:', joinData);

      // Si puede entrar directamente, redirigir al checkout
      if (joinData.canEnter) {
        console.log('[EventoContent] ✓ User can enter, redirecting to checkout...');
        startReservation(id, 300);
        // Navegar al checkout - QueueGuard verificará el acceso
        router.push(`/evento/comprar/${id}`);
        return;
      }

      // Si no puede entrar (está en cola), mostrar modal con su posición
      console.log('[EventoContent] User in queue, showing modal. Position:', joinData.position);
      setShowQueueModal(true);

      // Si hay personas comprando o en cola, mostrar el modal
      setShowQueueModal(true);
    } catch (error) {
      console.error('Error checking queue status:', error);
      // En caso de error, mostrar el modal por seguridad
      setShowQueueModal(true);
    }
  };

  // Función para entrar a comprar cuando es el turno
  const handleEnterPurchase = () => {
    if (id) {
      startReservation(id, 300);
      router.push(`/evento/comprar/${id}`);
    }
  };

  useEffect(() => {
    const coordRegex = /^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/;
    function geocodeAddress(address: string) {
      if (!window.google?.maps) return;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          setCoords({ lat: loc.lat(), lng: loc.lng() });
          setDisplayAddress(results[0].formatted_address || address);
        }
      });
    }
    function reverseGeocode(lat: number, lng: number) {
      if (!window.google?.maps) return;
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          setDisplayAddress(results[0].formatted_address || `${lat}, ${lng}`);
        }
      });
    }
    if (event?.ubicacion) {
      if (coordRegex.test(event.ubicacion)) {
        const [latStr, lngStr] = event.ubicacion.split(',');
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        setCoords({ lat, lng });
        setDisplayAddress(null);
        if (isLoaded) reverseGeocode(lat, lng);
      } else {
        geocodeAddress(event.ubicacion);
      }
    } else {
      setCoords(null);
      setDisplayAddress(null);
    }
  }, [event?.ubicacion, isLoaded]);

  const coverImage =
    event?.imagenes_evento?.find((i: any) => i.tipo === 'PORTADA')?.url ||
    event?.imagenes_evento?.[0]?.url ||
    undefined;

  return (
    <main className="min-h-screen py-16">
      {/* Banner de reserva temporal */}
      {isReserved && isReservationActive(id) && timeLeft > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-100 to-orange-100 border-b-2 border-yellow-400 shadow-lg">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-yellow-800 text-lg">Reserva temporal activa</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-yellow-800 text-lg">
                Tiempo restante: {formatTimeLeft(timeLeft)}
              </span>
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{Math.floor(timeLeft / 60)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {coverImage ? (
        <div
          style={{ backgroundImage: `url(${coverImage})` }}
          className="fixed left-0 top-0 z-5 h-full w-full bg-cover bg-center opacity-30 blur-lg filter"
        />
      ) : (
        <div className="fixed left-0 top-0 z-5 h-full w-full bg-gradient-to-b from-neutral-950 to-neutral-900" />
      )}

      <div
        className={`relative z-20 min-h-screen text-zinc-200 transition-all duration-500 ${isReserved && isReservationActive(id) && timeLeft > 0 ? 'pt-20' : ''}`}
      >
        <div className="mx-auto max-w-[68rem] space-y-2 px-20 pb-3 pt-10">
          <div className="grid gap-6 md:grid-cols-[350px,1fr]">
            <div className="space-y-2">
              {coverImage ? (
                <div className="relative rounded-xl overflow-hidden bg-stone-900 backdrop-blur-lg transition-all duration-300 aspect-square">
                  <Image
                    src={coverImage}
                    alt={event.titulo}
                    fill
                    className="object-cover"
                    sizes="(max-width: 900px) 100vw, 500px"
                    priority
                  />
                </div>
              ) : (
                <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-400/50 bg-stone-800/30">
                  <Calendar className="h-8 w-8 text-stone-200" />
                  <p className="mt-2 text-sm text-stone-500">Sin imagen de portada</p>
                </div>
              )}

              {event.imagenes_evento && event.imagenes_evento.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-stone-200">Galería de imágenes</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {event.imagenes_evento.slice(1).map((img) => (
                      <div
                        key={img.imagenid}
                        className="relative aspect-square overflow-hidden rounded-md"
                      >
                        <Image
                          src={img.url}
                          alt={event.titulo}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 200px"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h1 className="w-full border-none bg-transparent text-4xl font-normal text-stone-100">
                  {event.titulo}
                </h1>
              </div>

              {/* Contador de views */}
              {!isLoadingViews && viewCountData && (
                <div className="flex items-center gap-2 text-stone-400">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">
                    {viewCountData.views.toLocaleString()}{' '}
                    {viewCountData.views === 1 ? 'visita' : 'visitas'}
                  </span>
                </div>
              )}

              {event.fechas_evento && event.fechas_evento.length > 0 && (
                <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
                  <div className="flex items-center gap-2 pb-1">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <h3 className="text-sm font-semibold text-stone-200">Fechas del evento</h3>
                  </div>

                  <div className="text-stone-300 space-y-3">
                    {event.fechas_evento.map((fecha) => {
                      const startDate = formatEventDate(new Date(fecha.fecha_hora));
                      const endDate = fecha.fecha_fin
                        ? formatEventDate(new Date(fecha.fecha_fin))
                        : null;

                      return (
                        <div key={fecha.fechaid} className="space-y-1">
                          <div className="font-medium text-stone-200">
                            {startDate.dayName}, {startDate.dayNumber} de {startDate.monthName} de{' '}
                            {startDate.year}
                            {startDate.isToday && (
                              <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                                HOY
                              </span>
                            )}
                            {startDate.isTomorrow && (
                              <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                                MAÑANA
                              </span>
                            )}
                          </div>
                          <div className="ml-2 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-green-400" />
                                <span className="font-medium text-stone-300">Inicio</span>
                              </div>
                              <span className="text-stone-200">{startDate.time}</span>
                            </div>
                            {endDate && (
                              <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-red-400" />
                                  <span className="font-medium text-stone-300">Fin</span>
                                </div>
                                <span className="text-stone-200">{endDate.time}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {event.ubicacion && (
                <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
                  <h3 className="text-sm font-semibold text-stone-200">Ubicación</h3>
                  <p className="text-stone-300">{displayAddress || event.ubicacion}</p>
                  {isLoaded && coords && (
                    <div className="overflow-hidden rounded-md border border-stone-800">
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '220px' }}
                        center={coords}
                        zoom={14}
                        options={{
                          disableDefaultUI: true,
                          zoomControl: true,
                          styles: [
                            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                            {
                              elementType: 'labels.text.stroke',
                              stylers: [{ color: '#242f3e' }],
                            },
                            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                          ],
                        }}
                      >
                        <Marker position={coords} />
                      </GoogleMap>
                    </div>
                  )}
                </div>
              )}

              {event.descripcion && (
                <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
                  <h3 className="text-sm font-semibold text-stone-200">Descripción</h3>
                  <p className="text-stone-300 whitespace-pre-wrap">{event.descripcion}</p>
                </div>
              )}

              {/* Tipos de entradas (si existen) */}
              {Array.isArray(event.stock_entrada) && event.stock_entrada.length > 0 && (
                <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
                  <h3 className="text-sm font-semibold text-stone-200">Tipos de entradas</h3>
                  <ul className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {event.stock_entrada.map((stock) => (
                      <li
                        key={stock.stockid}
                        className="rounded-md border border-stone-700 bg-stone-800/60 p-2 text-sm text-stone-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{stock.nombre}</div>
                          </div>
                          <div className="text-right text-stone-300">
                            <div>${Number(stock.precio)}</div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mapa de sectores y resumen de entradas (solo informativo) */}
              {event.mapa_evento &&
                (event as any).mapa_evento &&
                ((event as any).mapa_evento.sectors?.length > 0 ||
                  (event as any).mapa_evento.elements?.length > 0) && (
                  <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
                    <h3 className="text-sm font-semibold text-stone-200">Mapa de sectores</h3>
                    <div className="text-stone-400 text-xs">Vista previa (solo informativa)</div>
                    <div className="w-full">
                      <div
                        className="relative mx-auto w-full max-w-full overflow-hidden rounded-md border border-stone-800"
                        style={{ height: 320 }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: (event as any).mapa_evento?.backgroundImage
                              ? `url(${(event as any).mapa_evento.backgroundImage})`
                              : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        {((event as any).mapa_evento?.sectors || []).map((s: any) => {
                          const scale = 1.8;
                          const baseW = (s.width / 800) * 100;
                          const baseH = (s.height / 600) * 100;
                          const w = baseW * scale;
                          const h = baseH * scale;
                          const baseL = (s.x / 800) * 100;
                          const baseT = (s.y / 600) * 100;
                          const l = Math.max(0, Math.min(100, baseL - (w - baseW) / 2));
                          const t = Math.max(0, Math.min(100, baseT - (h - baseH) / 2));
                          return (
                            <div
                              key={s.id}
                              className="absolute rounded-md border-2 border-black/30 text-white shadow-md"
                              style={{
                                left: `${l}%`,
                                top: `${t}%`,
                                width: `${w}%`,
                                height: `${h}%`,
                                backgroundColor: s.color || 'rgba(255,255,255,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                              }}
                              title={`${s.name}${s.capacity ? ` • Cap.: ${s.capacity}` : ''}${s.price ? ` • $${s.price}` : ''}`}
                            >
                              <span className="backdrop-blur-[1px] drop-shadow">{s.name}</span>
                            </div>
                          );
                        })}
                        {((event as any).mapa_evento?.elements || []).map((el: any) => {
                          const scale = 1.8;
                          const baseW = (el.width / 800) * 100;
                          const baseH = (el.height / 600) * 100;
                          const w = baseW * scale;
                          const h = baseH * scale;
                          const baseL = (el.x / 800) * 100;
                          const baseT = (el.y / 600) * 100;
                          const l = Math.max(0, Math.min(100, baseL - (w - baseW) / 2));
                          const t = Math.max(0, Math.min(100, baseT - (h - baseH) / 2));
                          return (
                            <div
                              key={el.id}
                              className="absolute rounded-md border border-black/30 text-white"
                              style={{
                                left: `${l}%`,
                                top: `${t}%`,
                                width: `${w}%`,
                                height: `${h}%`,
                                backgroundColor: el.color || 'rgba(0,0,0,0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                              }}
                              title={el.name}
                            >
                              <div className="text-center">
                                <div className="text-lg">{el.icon}</div>
                                <div className="text-[11px] opacity-90">{el.name}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {((event as any).mapa_evento?.sectors || []).length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-semibold text-stone-400">Precios por sector</h4>
                        <ul className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
                          {(event as any).mapa_evento.sectors.map((s: any) => {
                            const matchingStock = event.stock_entrada?.find(
                              (stock: any) =>
                                stock.nombre?.toLowerCase() === String(s.name).toLowerCase(),
                            );
                            const priceText = matchingStock
                              ? `$${Number(matchingStock.precio)}`
                              : typeof s.price === 'number'
                                ? `$${s.price}`
                                : '';
                            return (
                              <li
                                key={s.id}
                                className="rounded-md bg-stone-800/60 px-2 py-1 text-xs text-stone-200"
                              >
                                <div className="flex items-center justify-between">
                                  <span>{s.name}</span>
                                  <span className="text-stone-400">{priceText}</span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

              {/* Mensaje de tiempo expirado */}
              {showExpiredMessage && (
                <div className="mb-3 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⏱️</span>
                    <span>Tu tiempo de compra ha expirado. Puedes intentar comprar nuevamente.</span>
                  </div>
                </div>
              )}

              <div className="rounded-xl border-1 bg-stone-900 bg-opacity-60 p-2">
                <button
                  onClick={handleComprarEntradas}
                  className="w-full rounded-lg bg-white py-3 text-base font-medium text-black shadow-lg hover:bg-stone-200 transition-colors"
                >
                  Comprar Entradas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showQueueModal && (
        <QueueModal
          isOpen={showQueueModal}
          onClose={() => setShowQueueModal(false)}
          eventId={id || ''}
          userId={userId}
          eventTitle={event?.titulo || 'Evento'}
          onEnterPurchase={handleEnterPurchase}
        />
      )}
    </main>
  );
}
