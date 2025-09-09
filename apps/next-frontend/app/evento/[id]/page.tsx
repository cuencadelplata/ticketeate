'use client';

import NavbarHome from '@/components/navbar-main';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { usePublicEvent } from '@/hooks/use-events';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLoadScript, GoogleMap, Marker } from '@react-google-maps/api';

export default function EventoPage() {
  const params = useParams();
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
      {coverImage ? (
        <div
          style={{ backgroundImage: `url(${coverImage})` }}
          className="fixed left-0 top-0 z-5 h-full w-full bg-cover bg-center opacity-30 blur-lg filter"
        />
      ) : (
        <div className="fixed left-0 top-0 z-5 h-full w-full bg-gradient-to-b from-neutral-950 to-neutral-900" />
      )}

      <div className="relative z-20 min-h-screen overflow-hidden text-zinc-200 transition-all duration-500">
        <NavbarHome />
        <div className="mx-auto max-w-5xl space-y-2 px-20 pb-3 pt-10">
          {isLoading && <div className="text-orange-100">Cargando evento...</div>}
          {error && <div className="text-red-200">No se pudo cargar el evento.</div>}
          {!isLoading && !error && event && (
            <div className="grid gap-8 md:grid-cols-[330px,1fr]">
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
                            {new Date(f.fecha_hora).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}{' '}
                            {new Date(f.fecha_hora).toLocaleTimeString('es-AR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
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
                {Array.isArray((event as any).categorias_entrada) && (event as any).categorias_entrada.length > 0 && (
                  <div className="space-y-2 rounded-md border-1 bg-stone-900 bg-opacity-60 p-2">
                    <h3 className="text-sm font-semibold text-stone-200">Tipos de entradas</h3>
                    <ul className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2">
                      {(event as any).categorias_entrada.map((cat: any) => (
                        <li key={cat.id_categoria} className="rounded-md border border-stone-700 bg-stone-800/60 p-2 text-sm text-stone-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{cat.nombre}</div>
                              {cat.descripcion && (
                                <div className="text-xs text-stone-400">{cat.descripcion}</div>
                              )}
                            </div>
                            <div className="text-right text-stone-300">
                              <div>${'{'}cat.precio{'}'}</div>
                              <div className="text-xs text-stone-400">Cupo: {cat.stock_disponible} / {cat.stock_total}</div>
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
                    <div
                      className="relative w-full overflow-hidden rounded-md border border-stone-800"
                      style={{
                        height: 320,
                        backgroundImage: (event as any).mapa_evento?.backgroundImage
                          ? `url(${(event as any).mapa_evento.backgroundImage})`
                          : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {((event as any).mapa_evento?.sectors || []).map((s: any) => (
                        <div
                          key={s.id}
                          className="absolute rounded-sm border border-black/20 text-[10px] text-white"
                          style={{
                            left: s.x,
                            top: s.y,
                            width: s.width,
                            height: s.height,
                            backgroundColor: s.color || 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={`${s.name}${s.capacity ? ` • Cap.: ${s.capacity}` : ''}${s.price ? ` • $${s.price}` : ''}`}
                        >
                          <span className="backdrop-blur-sm drop-shadow">{s.name}</span>
                        </div>
                      ))}
                      {((event as any).mapa_evento?.elements || []).map((el: any) => (
                        <div
                          key={el.id}
                          className="absolute rounded-full border border-black/20 text-[9px] text-white"
                          style={{
                            left: el.x,
                            top: el.y,
                            width: el.width,
                            height: el.height,
                            backgroundColor: el.color || 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={el.name}
                        >
                          {el.icon}
                        </div>
                      ))}
                    </div>

                    {(((event as any).mapa_evento?.sectors || []).length ?? 0) > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-semibold text-stone-400">
                          Entradas disponibles por sector
                        </h4>
                        <ul className="mt-1 grid grid-cols-1 gap-1 md:grid-cols-2">
                          {(event as any).mapa_evento.sectors.map((s: any) => (
                            <li
                              key={s.id}
                              className="rounded-md bg-stone-800/60 px-2 py-1 text-xs text-stone-200"
                            >
                              <div className="flex items-center justify-between">
                                <span>{s.name}</span>
                                <span className="text-stone-400">
                                  {typeof s.capacity === 'number'
                                    ? `${s.capacity} entradas`
                                    : 'Capacidad no definida'}
                                  {typeof s.price === 'number' ? ` • $${s.price}` : ''}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-xl border-1 bg-stone-900 bg-opacity-60 p-2">
                  <button className="w-full rounded-lg bg-white py-3 text-base font-medium text-black shadow-lg hover:bg-stone-200">
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
