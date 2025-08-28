"use client"
import { useState, useMemo } from 'react';
import { EventCard, Event } from './event-card';
import { EventFilters, FilterState } from './event-filters';

// Datos de ejemplo para eventos
const sampleEvents: Event[] = [
  {
    id: '1',
    name: 'Fiesta de Verano en la Playa',
    description: 'Una noche mágica con música electrónica, bebidas tropicales y la mejor vibra del verano. Disfruta del atardecer mientras bailas al ritmo de los mejores DJs.',
    date: '15 Dic 2024',
    time: '20:00',
    location: 'Playa del Carmen, Cancún',
    imageUrl: '/api/placeholder/400/300',
    category: 'social',
    price: 'Gratis',
    capacity: 200,
    availableTickets: 150,
    organizer: 'Beach Club'
  },
  {
    id: '2',
    name: 'Exposición de Arte Contemporáneo',
    description: 'Descubre las obras más innovadoras de artistas emergentes latinoamericanos. Una experiencia cultural única que combina pintura, escultura y arte digital.',
    date: '20 Dic 2024',
    time: '18:00',
    location: 'Museo de Arte Moderno, CDMX',
    imageUrl: '/api/placeholder/400/300',
    category: 'cultural',
    price: '$150',
    capacity: 100,
    availableTickets: 75,
    organizer: 'Arte Latino'
  },
  {
    id: '3',
    name: 'Concierto de Rock Indie',
    description: 'Las mejores bandas independientes del país se reúnen para una noche épica de rock alternativo. No te pierdas esta experiencia musical única.',
    date: '22 Dic 2024',
    time: '21:00',
    location: 'Foro Sol, CDMX',
    imageUrl: '/api/placeholder/400/300',
    category: 'musica',
    price: '$300',
    capacity: 5000,
    availableTickets: 3200,
    organizer: 'Rock Nation'
  },
  {
    id: '4',
    name: 'Networking Empresarial',
    description: 'Conecta con profesionales de tu industria en un ambiente relajado. Charlas inspiradoras, networking de calidad y oportunidades de negocio.',
    date: '25 Dic 2024',
    time: '19:00',
    location: 'Centro de Convenciones, Monterrey',
    imageUrl: '/api/placeholder/400/300',
    category: 'social',
    price: '$200',
    capacity: 150,
    availableTickets: 120,
    organizer: 'Business Connect'
  },
  {
    id: '5',
    name: 'Festival de Cine Independiente',
    description: 'Proyecciones de películas independientes nacionales e internacionales. Charlas con directores, talleres de cinematografía y mucho más.',
    date: '28 Dic 2024',
    time: '17:00',
    location: 'Cineteca Nacional, CDMX',
    imageUrl: '/api/placeholder/400/300',
    category: 'cultural',
    price: '$100',
    capacity: 300,
    availableTickets: 250,
    organizer: 'Cine Indie MX'
  },
  {
    id: '6',
    name: 'Concierto de Jazz al Aire Libre',
    description: 'Disfruta de una velada mágica con los mejores músicos de jazz del país. Música relajante bajo las estrellas en un ambiente íntimo y elegante.',
    date: '30 Dic 2024',
    time: '20:30',
    location: 'Jardín Botánico, Guadalajara',
    imageUrl: '/api/placeholder/400/300',
    category: 'musica',
    price: '$180',
    capacity: 200,
    availableTickets: 180,
    organizer: 'Jazz Club'
  }
];

interface EventsGridProps {
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  showFilters?: boolean;
}

export function EventsGrid({ 
  title = "Eventos Destacados", 
  subtitle = "Descubre los mejores eventos de la temporada",
  showViewAll = true,
  showFilters = true
}: EventsGridProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    location: '',
    date: '',
  });

  // Filtrar eventos basado en los filtros aplicados
  const filteredEvents = useMemo(() => {
    return sampleEvents.filter(event => {
      // Filtro de búsqueda por texto
      if (filters.search && !event.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !event.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Filtro por categoría
      if (filters.category && event.category !== filters.category) {
        return false;
      }
      
      // Filtro por ubicación
      if (filters.location && !event.location.includes(filters.location)) {
        return false;
      }
      
      // Filtro por fecha (simplificado para el ejemplo)
      if (filters.date) {
        // Aquí podrías implementar lógica más compleja de filtrado por fecha
        // Por ahora solo verificamos que el evento tenga fecha
        if (!event.date) return false;
      }
      
      return true;
    });
  }, [filters]);

  return (
    <section className="py-16 bg-gradient-to-b from-background to-gray-900/20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Filtros */}
        {showFilters && (
          <EventFilters onFiltersChange={setFilters} />
        )}

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* View All Button */}
            {showViewAll && (
              <div className="text-center">
                <button className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-full hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Ver Todos los Eventos
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No se encontraron eventos
            </h3>
            <p className="text-gray-400 mb-6">
              Intenta ajustar los filtros de búsqueda
            </p>
            <button 
              onClick={() => setFilters({ search: '', category: '', location: '', date: '' })}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
