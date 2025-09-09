"use client";

import NavbarHome from '@/components/navbar-main';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { usePublicEvent } from '@/hooks/use-events';

export default function EventoPage() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : undefined;
  const { data: event, isLoading, error } = usePublicEvent(id);

  return (
    <main className="min-h-screen">
      <NavbarHome />

      <section className="rounded-small bg-orange-900 container mx-auto px-4 py-8 mt-5">
        {isLoading && <div className="text-orange-100">Cargando evento...</div>}
        {error && <div className="text-red-200">No se pudo cargar el evento.</div>}
        {!isLoading && !error && event && (
          <div className="grid gap-6 md:grid-cols-[1fr,360px]">
            <div className="space-y-4">
              <div className="w-full overflow-hidden rounded-xl border-1.5 border-orange-600 bg-orange-100">
                <Image
                  src={
                    event.imagenes_evento?.find((i) => i.tipo === 'portada')?.url ||
                    event.imagenes_evento?.[0]?.url ||
                    '/icon-ticketeate.png'
                  }
                  alt={event.titulo}
                  width={1200}
                  height={600}
                  className="w-full h-80 object-cover"
                />
              </div>

              <h1 className="text-3xl font-bold text-orange-100">{event.titulo}</h1>
              {event.descripcion && (
                <p className="text-orange-100/90 whitespace-pre-wrap">{event.descripcion}</p>
              )}

              {event.ubicacion && (
                <p className="text-orange-200">Ubicación: {event.ubicacion}</p>
              )}

              {event.fechas_evento && event.fechas_evento.length > 0 && (
                <div className="text-orange-100">
                  <h2 className="text-xl font-semibold mb-2">Fechas</h2>
                  <ul className="list-disc pl-6">
                    {event.fechas_evento.map((f) => (
                      <li key={f.id_fecha}>
                        {new Date(f.fecha_hora).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border-1.5 border-orange-600 bg-orange-100 p-4">
                <button className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600">
                  Comprar Entradas
                </button>
              </div>
            </aside>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
