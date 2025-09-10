'use client';

import NavbarHome from '@/components/navbar-main';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { usePublicEvent } from '@/hooks/use-events';
import { useReservation } from '@/hooks/use-reservation';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

export default function EventoPage() {
  const params = useParams();
  const router = useRouter();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params?.id[0]
        : undefined;
  const { data: event, isLoading, error } = usePublicEvent(id);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [displayAddress, setDisplayAddress] = useState<string | null>(null);

  // Hook para manejar reserva temporal
  const { isReserved, timeLeft, startReservation, formatTimeLeft, isReservationActive } =
    useReservation();

  // Función para manejar el clic en "Comprar Entradas"
  const handleComprarEntradas = () => {
    if (id) {
      // Iniciar reserva temporal de 5 minutos
      startReservation(id, 300);
      router.push(`/comprar?evento=${id}`);
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
    event?.imagenes_evento?.find((i) => i.tipo === 'portada')?.url ||
    event?.imagenes_evento?.[0]?.url ||
    undefined;

  return (
    <main className="min-h-screen">
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
        className={`relative z-20 min-h-screen overflow-hidden text-zinc-200 transition-all duration-500 ${isReserved && isReservationActive(id) && timeLeft > 0 ? 'pt-20' : ''}`}
      >
        <NavbarHome />
        <div className="mx-auto max-w-[68rem] space-y-2 px-20 pb-3 pt-10">
          {isLoading && <div className="text-orange-100">Cargando evento...</div>}
          {error && <div className="text-red-200">No se pudo cargar el evento.</div>}
          {!isLoading && !error && event && (
            <div className="grid gap-8 md:grid-cols-[300px,1fr]">
              <div className="space-y-2">
                <div
                  style={
                    coverImage
                      ? {
                          backgroundImage: `url(${coverImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {}
                  }
                  className={`rounded-xl bg-stone-900 backdrop-blur-lg transition-all duration-300 ${coverImage ? 'h-80' : ''}`}
                >
                  {!coverImage && (
                    <div className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-400/50 bg-stone-800/30">
                      <Calendar className="h-8 w-8 text-stone-200" />
                      <p className="mt-2 text-sm text-stone-500">Sin imagen de portada</p>
                    </div>
                  )}
                </div>

                {event.imagenes_evento && event.imagenes_evento.length > 1 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-stone-200">Galería de imágenes</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {event.imagenes_evento.slice(1).map((img) => (
                        <div
                          key={img.id_imagen}
                          className="aspect-square overflow-hidden rounded-lg"
                        >
                          <img
                            src={img.url}
                            alt={event.titulo}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h1 className="w-full border-none bg-transparent text-3xl font-normal text-stone-100">
                    {event.titulo}
                  </h1>
                </div>

                <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
                  <div className="flex items-center gap-2 pb-1">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <h3 className="text-sm font-semibold text-stone-200">Fechas del evento</h3>
                  </div>
                  <div className="text-stone-300 space-y-1">
                    <div>
                      <span className="font-medium">Inicio: </span>
                      {new Date(event.fecha_inicio_venta).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}{' '}
                      {new Date(event.fecha_inicio_venta).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div>
                      <span className="font-medium">Fin: </span>
                      {new Date(event.fecha_fin_venta).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}{' '}
                      {new Date(event.fecha_fin_venta).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {event.fechas_evento && event.fechas_evento.length > 0 && (
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold text-stone-400">Fechas adicionales</h4>
                      <ul className="list-disc pl-6 text-stone-200">
                        {event.fechas_evento.map((f) => (
                          <li key={f.id_fecha}>
                            <span>
                              <span className="font-medium">Inicio: </span>
                              {new Date(f.fecha_hora).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}{' '}
                              {new Date(f.fecha_hora).toLocaleTimeString('es-AR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {(f as any).fecha_fin && (
                              <span>
                                {' '}
                                · <span className="font-medium">Fin: </span>
                                {new Date((f as any).fecha_fin).toLocaleDateString('es-AR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}{' '}
                                {new Date((f as any).fecha_fin).toLocaleTimeString('es-AR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

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
                {Array.isArray((event as any).categorias_entrada) &&
                  (event as any).categorias_entrada.length > 0 && (
                    <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
                      <h3 className="text-sm font-semibold text-stone-200">Tipos de entradas</h3>
                      <ul className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2">
                        {(event as any).categorias_entrada.map((cat: any) => (
                          <li
                            key={cat.id_categoria}
                            className="rounded-md border border-stone-700 bg-stone-800/60 p-2 text-sm text-stone-200"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{cat.nombre}</div>
                                {cat.descripcion && (
                                  <div className="text-xs text-stone-400">{cat.descripcion}</div>
                                )}
                              </div>
                              <div className="text-right text-stone-300">
                                <div>
                                  ${'{'}cat.precio{'}'}
                                </div>
                                <div className="text-xs text-stone-400">
                                  Cupo: {cat.stock_disponible} / {cat.stock_total}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Mapa de sectores y resumen de entradas (solo informativo) */}
                {event.mapa_evento && (
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

                    {(((event as any).mapa_evento?.sectors || []).length ?? 0) > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-semibold text-stone-400">
                          Entradas disponibles por sector
                        </h4>
                        <ul className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
                          {(event as any).mapa_evento.sectors.map((s: any) => {
                            const matchingCat = (event as any).categorias_entrada?.find(
                              (c: any) => c.nombre?.toLowerCase() === String(s.name).toLowerCase(),
                            );
                            const capText = matchingCat
                              ? `${matchingCat.stock_disponible ?? matchingCat.stock_total}/${matchingCat.stock_total} entradas`
                              : typeof s.capacity === 'number'
                                ? `${s.capacity} entradas`
                                : 'Capacidad no definida';
                            const priceText = matchingCat
                              ? ` • $${matchingCat.precio}`
                              : typeof s.price === 'number'
                                ? ` • $${s.price}`
                                : '';
                            return (
                              <li
                                key={s.id}
                                className="rounded-md bg-stone-800/60 px-2 py-1 text-xs text-stone-200"
                              >
                                <div className="flex items-center justify-between">
                                  <span>{s.name}</span>
                                  <span className="text-stone-400">
                                    {capText}
                                    {priceText}
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
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
          )}
        </div>
      </div>

      <div className="relative z-20">
        <Footer />
      </div>
    </main>
  );
}
