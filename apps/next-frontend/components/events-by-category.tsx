'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EventCard } from '@/components/event-card';
import { useAllEvents } from '@/hooks/use-events';
import { useCategories } from '@/hooks/use-categories';
import { Tag, Filter } from 'lucide-react';

interface EventByCategoryProps {
  categoryId?: number;
  categoryName?: string;
  showFilter?: boolean;
}

export function EventsByCategory({ 
  categoryId, 
  categoryName, 
  showFilter = true 
}: EventByCategoryProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(categoryId || null);
  const { data: allEvents = [], isLoading: eventsLoading } = useAllEvents();
  const { data: categories = [] } = useCategories();

  // Filtrar eventos por categoría
  const filteredEvents = allEvents.filter((event) => {
    if (!selectedCategoryId) return true;
    return event.categoriaevento?.categoriaeventoid === BigInt(selectedCategoryId);
  });

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  return (
    <div className="py-16 bg-white">
      <div className="max-w-full mx-auto pt-10 px-2">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-instrument-serif text-6xl bg-gradient-to-b from-black to-stone-900 bg-clip-text text-transparent mb-2 pb-2">
            {categoryName || 'Eventos por Categoría'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-stone-500 max-w-2xl mx-auto">
            Descubrí eventos increíbles organizados por categoría
          </p>
        </div>

        {/* Filtro de categorías */}
        {showFilter && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filtrar por categoría:</h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedCategoryId === null
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Tag className="h-4 w-4" />
                  Todas las categorías
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selectedCategoryId === category.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Tag className="h-4 w-4" />
                    {category.name}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Contador de eventos */}
        {selectedCategory && (
          <div className="mb-6">
            <p className="text-gray-600">
              Mostrando {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} en{' '}
              <span className="font-semibold text-orange-600">{selectedCategory.name}</span>
            </p>
          </div>
        )}

        {/* Grid de eventos */}
        {eventsLoading ? (
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-stone-200 dark:bg-stone-700 rounded-2xl h-64 mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-stone-200 dark:bg-stone-700 h-4 rounded w-3/4"></div>
                  <div className="bg-stone-200 dark:bg-stone-700 h-3 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
            {filteredEvents.map((event, i) => {
              // Obtener imagen de portada o primera imagen
              const portada = event.imagenes_evento?.find((i) => i.tipo === 'PORTADA')?.url;
              const primera = event.imagenes_evento?.[0]?.url;
              const image = portada || primera || '/icon-ticketeate.png';

              // Obtener fecha del evento
              const eventDate = event.fechas_evento?.[0]?.fecha_hora
                ? new Date(event.fechas_evento[0].fecha_hora)
                : new Date(event.fecha_creacion);
              const date = eventDate.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              // Obtener estado actual del evento
              const estadoActual = event.evento_estado?.[0]?.Estado || 'OCULTO';

              // Obtener categoría
              const categoriaPrincipal = event.categoriaevento?.nombre || 'Evento';

              // Determinar si es gratis o pago
              const isFree =
                !event.stock_entrada ||
                event.stock_entrada.length === 0 ||
                event.stock_entrada.every((ticket) => Number(ticket.precio) === 0);

              // Obtener precio mínimo
              const precios =
                event.stock_entrada?.map((ticket) => Number(ticket.precio)).filter((p) => p > 0) || [];
              const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <EventCard
                    title={event.titulo}
                    description={event.descripcion || ''}
                    price={isFree ? 'Gratis' : `Desde $${precioMinimo}`}
                    date={date}
                    eventDate={eventDate}
                    image={image}
                    category={categoriaPrincipal}
                    category2={event.ubicacion || ''}
                    disponibilidad={estadoActual === 'ACTIVO' ? 'Disponibles' : 'Oculto'}
                    href={`/evento/${event.eventoid}`}
                    isFree={isFree}
                    categorias={[categoriaPrincipal]}
                    fechasAdicionales={[]}
                    totalDates={1}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-8 inline-block">
              <Tag className="h-20 w-20 text-gray-400 mx-auto" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-gray-600">
              No hay eventos en esta categoría
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {selectedCategory 
                ? `No se encontraron eventos en la categoría "${selectedCategory.name}".`
                : 'No se encontraron eventos con los filtros aplicados.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
