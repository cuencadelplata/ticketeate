'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EventCard } from '@/components/event-card';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
import { CategorySelector } from '@/components/category-selector';
import { useAllEvents } from '@/hooks/use-events';

const estadoEvents: Record<string, string> = {
  ACTIVO: 'Disponibles',
  COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
  OCULTO: 'Oculto',
};

function mapEstados(estado?: string) {
  //mapeo disponibilidad events
  return estadoEvents[estado ?? ''] ?? 'Oculto';
}

export default function Home() {
  const { data: allEvents = [], isLoading } = useAllEvents(); //tanstack query

  const uiEvents = useMemo(() => {
    return (allEvents || []).map((evt) => {
      // Obtener imagen de portada o primera imagen
      const portada = evt.imagenes_evento?.find((i) => i.tipo === 'PORTADA')?.url;
      const primera = evt.imagenes_evento?.[0]?.url;
      const image = portada || primera || '/icon-ticketeate.png';

      // Obtener fecha del evento
      const eventDate = evt.fechas_evento?.[0]?.fecha_hora
        ? new Date(evt.fechas_evento[0].fecha_hora)
        : new Date(evt.fecha_creacion);
      const date = eventDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Obtener estado actual del evento
      const estadoActual = evt.evento_estado?.[0]?.Estado || 'OCULTO';

      // Obtener categoría
      const categoriaPrincipal = evt.categoriaevento?.nombre || 'Evento';

      // Determinar si es gratis o pago
      const isFree =
        !evt.stock_entrada ||
        evt.stock_entrada.length === 0 ||
        evt.stock_entrada.every((ticket) => Number(ticket.precio) === 0);

      // Obtener precio mínimo
      const precios =
        evt.stock_entrada?.map((ticket) => Number(ticket.precio)).filter((p) => p > 0) || [];
      const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0;

      // Formatear fechas adicionales
      const fechasAdicionales =
        evt.fechas_evento?.slice(1).map((fecha) =>
          new Date(fecha.fecha_hora).toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
          }),
        ) || [];

      return {
        title: evt.titulo,
        description: evt.descripcion || '',
        price: isFree ? 'Gratis' : `Desde $${precioMinimo}`,
        date,
        eventDate, // Agregamos la fecha como objeto Date para filtrar
        image,
        category: categoriaPrincipal,
        category2: evt.ubicacion || '',
        disponibilidad: mapEstados(estadoActual),
        href: `/evento/${evt.eventoid}`,
        // Nuevos campos
        isFree,
        categorias: [categoriaPrincipal],
        fechasAdicionales: fechasAdicionales,
        totalDates: (evt.fechas_evento?.length || 0) + 1, // +1 por la fecha principal
      };
    });
  }, [allEvents]);

  // Filtrar eventos por fecha
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return uiEvents.filter((event) => event.eventDate > now);
  }, [uiEvents]);

  const pastEvents = useMemo(() => {
    const now = new Date();
    return uiEvents.filter((event) => event.eventDate <= now);
  }, [uiEvents]);

  return (
    <main className="min-h-screen">
      <Hero />
      <CategorySelector />

      <>
        {/* Sección principal de eventos */}
        <section className="pt-16 pb-16 bg-white">
          <div className="max-w-full mx-auto px-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-instrument-serif text-6xl bg-gradient-to-b from-black to-stone-900 bg-clip-text text-transparent mb-2 pb-2">
                Descubrí los mejores eventos
              </h2>
              <p className="text-lg text-gray-600 dark:text-stone-500 max-w-2xl mx-auto">
                Encontrá eventos increíbles cerca de vos y reservá tu lugar
              </p>
            </motion.div>

            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-stone-200 dark:bg-stone-700 rounded-2xl h-64 mb-4"></div>
                      <div className="space-y-2">
                        <div className="bg-stone-200 dark:bg-stone-700 h-4 rounded w-3/4"></div>
                        <div className="bg-stone-200 dark:bg-stone-700 h-3 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                : uiEvents.map((event, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <EventCard {...event} />
                    </motion.div>
                  ))}
            </div>
          </div>
        </section>

        {/* Sección de Próximos Eventos */}
        {upcomingEvents.length > 0 && (
          <section className="py-16 bg-gray-50 dark:bg-stone-900">
            <div className="max-w-full mx-auto px-2">
              <div className="text-center mb-12">
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 font-instrument-serif">
                  Próximos Eventos
                </h2>
                <p className="text-lg text-gray-600 dark:text-stone-400">
                  No te pierdas estos eventos que están por venir
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
                {upcomingEvents.map((event, i) => (
                  <motion.div
                    key={`upcoming-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <EventCard {...event} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Sección de Eventos Pasados */}
        {pastEvents.length > 0 && (
          <section className="py-16 bg-white dark:bg-stone-800">
            <div className="max-w-full mx-auto px-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-4">
                  Eventos Pasados
                </h2>
                <p className="text-lg text-gray-600 dark:text-stone-400">
                  Reviví los mejores momentos de eventos anteriores
                </p>
              </motion.div>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {pastEvents.map((event, i) => (
                  <motion.div
                    key={`past-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <EventCard {...event} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </>
      <Footer />
    </main>
  );
}
