'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import NavbarHome from '@/components/navbar-main';
import { EventCard } from '@/components/event-card';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
import { useAllEvents } from '@/hooks/use-events';

const estadoEvents: Record<string, string> = {
  ACTIVO: 'Disponibles',
  COMPLETADO: 'Agotadas',
  CANCELADO: 'Agotadas',
};

function mapEstados(estado?: string) {
  //mapeo disponibilidad events
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
      const eventDate = evt.fechas_evento?.[0]?.fecha_hora
        ? new Date(evt.fechas_evento[0].fecha_hora)
        : new Date(evt.fecha_inicio_venta);
      const date = eventDate.toLocaleDateString();
      return {
        title: evt.titulo,
        description: evt.descripcion || '',
        price: 'Consultar',
        date,
        eventDate, // Agregamos la fecha como objeto Date para filtrar
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

  // Filtrar eventos por fecha
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return uiEvents.filter((event) => event.eventDate > now);
  }, [uiEvents]);

  const pastEvents = useMemo(() => {
    const now = new Date();
    return uiEvents.filter((event) => event.eventDate <= now);
  }, [uiEvents]);

  const handleClear = () => {
    router.push('/'); // quita ?search y vuelve a home
  };

  return (
    <main className="min-h-screen">
      <NavbarHome />

      {!showingSearch && <Hero />}

      {showingSearch ? (
        <section className="pt-20 pb-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Resultados para:{' '}
                <span className="text-orange-600 dark:text-orange-400 italic">"{q}"</span>
              </h1>
              <button
                onClick={handleClear}
                className="rounded-full bg-gray-200 dark:bg-gray-700 px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                Limpiar búsqueda
              </button>
            </motion.div>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              {results.length} resultado(s) encontrado(s)
            </p>

            {results.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <EventCard {...event} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16"
              >
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  No se encontraron eventos. Probá con otro término.
                </div>
              </motion.div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Sección principal de eventos */}
          <section className="pt-20 pb-16 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Descubrí los mejores eventos
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Encontrá eventos increíbles cerca de vos y reservá tu lugar
                </p>
              </motion.div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-64 mb-4"></div>
                        <div className="space-y-2">
                          <div className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-3/4"></div>
                          <div className="bg-gray-200 dark:bg-gray-700 h-3 rounded w-1/2"></div>
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
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-7xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Próximos Eventos
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    No te pierdas estos eventos que están por venir
                  </p>
                </motion.div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <section className="py-16 bg-white dark:bg-gray-800">
              <div className="max-w-7xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Eventos Pasados
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Reviví los mejores momentos de eventos anteriores
                  </p>
                </motion.div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

          {/* CTA Section */}
          <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-700">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-white">¿Listo para crear tu evento?</h2>
                <p className="text-xl text-orange-100">
                  Únete a miles de organizadores que ya confían en Ticketeate
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-orange-600 shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  Crear mi evento ahora
                </motion.button>
              </motion.div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  );
}
