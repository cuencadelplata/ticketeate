'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NavbarHome from '@/components/navbar-main';
import { EventCard } from '@/components/event-card';
import { Footer } from '@/components/footer';
import Carrusel from '@/components/carrusel';
import { useAllEvents } from '@/hooks/use-events';


const estadoEvents: Record<string, string> = {
  ACTIVO: 'Disponibles',
  COMPLETADO: 'Agotadas',
  CANCELADO: 'Agotadas',
};

function mapEstados(estado?: string) { //mapeo disponibilidad events
  return estadoEvents[estado ?? ''] ?? 'Disponibles';
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: allEvents = [], isLoading } = useAllEvents(); //tanstack query
  const q = (searchParams.get('search') || '').trim();
  const showingSearch = Boolean(q);

  const uiEvents = useMemo(() => {
    return (allEvents || []).map((evt) => {
      const portada = evt.imagenes_evento?.find((i) => i.tipo === 'portada')?.url;
      const primera = evt.imagenes_evento?.[0]?.url;
      const image = portada || primera || '/icon-ticketeate.png';
      const date = evt.fechas_evento?.[0]?.fecha_hora
        ? new Date(evt.fechas_evento[0].fecha_hora).toLocaleDateString()
        : new Date(evt.fecha_inicio_venta).toLocaleDateString();
      return {
        title: evt.titulo,
        description: evt.descripcion || '',
        price: 'Consultar',
        date,
        image,
        category: 'Evento',
        category2: evt.ubicacion || '',
        disponibilidad: mapEstados(evt.estado),
        href: `/evento/${evt.id_evento}`,
      };
    });
  }, [allEvents]);

  const results = useMemo(() => {
    if (!q) return [];
    const qLower = q.toLowerCase();
    return uiEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(qLower) ||
        e.description.toLowerCase().includes(qLower) ||
        (e.category && e.category.toLowerCase().includes(qLower)) ||
        (e.category2 && e.category2.toLowerCase().includes(qLower)),
    );
  }, [q, uiEvents]);

  const handleClear = () => {
    router.push('/'); // quita ?search y vuelve a home
  };

  return (
    <main className="min-h-screen">
      <NavbarHome />

      {!showingSearch && <Carrusel />}

      {showingSearch ? (
        <section className="rounded-small bg-orange-900 container mx-auto px-4 py-8 mt-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-orange-100">
              Resultados para: <span className="italic">“{q}”</span>
            </h1>
            <button
              onClick={handleClear}
              className="rounded-full bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              Limpiar búsqueda
            </button>
          </div>
          <p className="text-orange-200 mb-6">{results.length} resultado(s) encontrado(s)</p>

          {results.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((event, i) => (
                <EventCard key={i} {...event} />
              ))}
            </div>
          ) : (
            <div className="text-orange-100">
              No se encontraron eventos. Probá con otro término.
            </div>
          )}
        </section>
      ) : (
        <>
          <section className="rounded-small bg-orange-900 container mx-auto px-2 py-8 mt-5">
            <h1 className="text-2xl font-bold mb-6 text-orange-100">Ver Todo</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <div className="text-orange-100">Cargando eventos...</div>
              ) : (
                uiEvents.map((event, i) => <EventCard key={i} {...event} />)
              )}
            </div>
          </section>

          <div className="flex justify-center mt-12">
            <button className="rounded-full bg-red-800 px-12 py-6 text-white hover:bg-red-700 text-lg">
              Botón de Arrepentimiento
            </button>
          </div>
        </>
      )}

      <Footer />
    </main>
  );
}
