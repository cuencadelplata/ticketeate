'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { EventCard } from '@/components/event-card';
import { Hero } from '@/components/hero';
import { CategorySelector } from '@/components/category-selector';
import { EventFiltersBar, EventFilter } from '@/components/event-filters-bar';
import { useAllEvents } from '@/hooks/use-events';
import { MapPin } from 'lucide-react';
import { useSearch } from '@/contexts/search-context';

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
  const [activeFilters, setActiveFilters] = useState<EventFilter[]>([]);
  const { searchQuery } = useSearch();

  const uiEvents = useMemo(() => {
    return (allEvents || []).map((evt) => {
      // Obtener imagen de portada o primera imagen
      const portada = evt.imagenes_evento?.find((i) => i.tipo === 'PORTADA')?.url;
      const primera = evt.imagenes_evento?.[0]?.url;
      const image = portada || primera || '/icon-ticketeate.png';

      // Obtener fecha del evento
      const eventDate = evt.fechas_evento?.[0]?.fecha_hora
        ? new Date(evt.fechas_evento[0].fecha_hora)
        : new Date(evt.fecha_creacion || Date.now());
      const date = eventDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // Obtener estado actual del evento
      const estadoActual = evt.evento_estado?.[0]?.Estado || 'OCULTO';

      // Obtener categoría principal del evento
      const categoriaPrincipal = evt.evento_categorias?.[0]?.categoriaevento?.nombre || 'Evento';

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
        totalDates: evt.fechas_evento?.length || 1, // Total de fechas del evento
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

  // Filtrar eventos según los filtros activos y búsqueda
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Obtener día de la semana (0 = domingo, 6 = sábado)
    const dayOfWeek = now.getDay();
    const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday);
    const nextSunday = new Date(nextSaturday);
    nextSunday.setDate(nextSunday.getDate() + 1);
    const mondayAfter = new Date(nextSunday);
    mondayAfter.setDate(mondayAfter.getDate() + 1);

    let filtered = [...uiEvents];

    // Aplicar búsqueda en tiempo real
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.category.toLowerCase().includes(query) ||
          event.category2.toLowerCase().includes(query),
      );
    }

    // Si "Todos" está activo o no hay filtros, mostrar todos los eventos próximos
    const allFilterActive = activeFilters.find((f) => f.id === 'all')?.active;
    if (allFilterActive || activeFilters.length === 0) {
      return filtered.filter((event) => event.eventDate > now);
    }

    // Aplicar filtros activos
    activeFilters.forEach((filter) => {
      if (!filter.active || filter.id === 'all') return;

      switch (filter.id) {
        case 'online':
          filtered = filtered.filter((event) =>
            event.category2?.toLowerCase().includes('online'),
          );
          break;
        case 'today':
          filtered = filtered.filter((event) => {
            const eventDate = new Date(event.eventDate);
            return eventDate >= today && eventDate < tomorrow;
          });
          break;
        case 'weekend':
          filtered = filtered.filter((event) => {
            const eventDate = new Date(event.eventDate);
            return eventDate >= nextSaturday && eventDate < mondayAfter;
          });
          break;
        case 'free':
          filtered = filtered.filter((event) => event.isFree);
          break;
        case 'music':
          filtered = filtered.filter((event) =>
            event.category?.toLowerCase().includes('música'),
          );
          break;
      }
    });

    return filtered.filter((event) => event.eventDate > now);
  }, [uiEvents, activeFilters, searchQuery]);

  // Eventos destacados (primeros 10 eventos próximos para llenar 2 filas de 5)
  const featuredEvents = useMemo(() => {
    return filteredEvents.slice(0, 10);
  }, [filteredEvents]);

  return (
    <main className="min-h-screen">
      <Hero />
      
      <CategorySelector />
      
      {/* Barra de filtros sticky */}
      <EventFiltersBar onFilterChange={setActiveFilters} />

      <>
        {/* Sección de Tendencias Principales - Similar a Eventbrite */}
        {featuredEvents.length > 0 && (
          <section className="pt-12 pb-8 bg-white dark:bg-stone-950">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-instrument-serif text-3xl sm:text-4xl lg:text-5xl bg-gradient-to-b from-black to-stone-900 dark:from-white dark:to-stone-300 bg-clip-text text-transparent">
                    Tendencias principales en Buenos Aires
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <MapPin className="h-4 w-4" />
                  <span>Buenos Aires, Argentina</span>
                </div>
              </motion.div>

              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-stone-200 dark:bg-stone-800 rounded-xl h-48 mb-3"></div>
                        <div className="space-y-2 px-2">
                          <div className="bg-stone-200 dark:bg-stone-800 h-4 rounded w-3/4"></div>
                          <div className="bg-stone-200 dark:bg-stone-800 h-3 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  : featuredEvents.map((event, i) => (
                      <motion.div
                        key={`featured-${i}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.05 }}
                        viewport={{ once: true }}
                      >
                        <EventCard {...event} />
                      </motion.div>
                    ))}
              </div>
            </div>
          </section>
        )}

        {/* Sección principal de eventos filtrados */}
        <section className="py-12 bg-gray-50 dark:bg-stone-900">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="font-instrument-serif text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white mb-2">
                {activeFilters.find((f) => f.id !== 'all' && f.active)
                  ? `Eventos ${activeFilters.find((f) => f.id !== 'all' && f.active)?.label}`
                  : 'Todos los eventos'}
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {filteredEvents.length} eventos disponibles
              </p>
            </motion.div>

            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {isLoading
                ? Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-stone-200 dark:bg-stone-800 rounded-xl h-48 mb-3"></div>
                      <div className="space-y-2 px-2">
                        <div className="bg-stone-200 dark:bg-stone-800 h-4 rounded w-3/4"></div>
                        <div className="bg-stone-200 dark:bg-stone-800 h-3 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                : filteredEvents.map((event, i) => (
                    <motion.div
                      key={`filtered-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.3) }}
                      viewport={{ once: true }}
                    >
                      <EventCard {...event} />
                    </motion.div>
                  ))}
            </div>

            {filteredEvents.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-xl text-stone-600 dark:text-stone-400">
                  No se encontraron eventos con los filtros seleccionados
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-500 mt-2">
                  Intenta ajustar los filtros para ver más resultados
                </p>
              </motion.div>
            )}
          </div>
        </section>

        {/* Sección de Eventos Pasados */}
        {pastEvents.length > 0 && !activeFilters.some((f) => f.id !== 'all' && f.active) && (
          <section className="py-12 bg-white dark:bg-stone-950">
            <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="font-instrument-serif text-3xl sm:text-4xl text-stone-900 dark:text-white mb-2">
                  Eventos Pasados
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Reviví los mejores momentos
                </p>
              </motion.div>
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {pastEvents.slice(0, 15).map((event, i) => (
                  <motion.div
                    key={`past-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i * 0.02, 0.2) }}
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
    </main>
  );
}
