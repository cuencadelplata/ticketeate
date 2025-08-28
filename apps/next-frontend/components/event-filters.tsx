import { useState } from 'react';
import { Search, Filter, MapPin, Calendar, Music, Palette, Users2 } from 'lucide-react';

interface EventFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  category: string;
  location: string;
  date: string;
}

const categories = [
  { value: '', label: 'Todas las categorías', icon: Filter },
  { value: 'social', label: 'Eventos Sociales', icon: Users2 },
  { value: 'cultural', label: 'Eventos Culturales', icon: Palette },
  { value: 'musica', label: 'Música en Vivo', icon: Music },
];

const locations = [
  { value: '', label: 'Todas las ubicaciones' },
  { value: 'CDMX', label: 'Ciudad de México' },
  { value: 'Monterrey', label: 'Monterrey' },
  { value: 'Guadalajara', label: 'Guadalajara' },
  { value: 'Cancún', label: 'Cancún' },
];

export function EventFilters({ onFiltersChange }: EventFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    location: '',
    date: '',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-[#1a1f2e] rounded-lg p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#252a3a] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-4 py-2 bg-[#252a3a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-4 py-2 bg-[#252a3a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {locations.map((location) => (
              <option key={location.value} value={location.value}>
                {location.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div>
          <select
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="w-full px-4 py-2 bg-[#252a3a] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="tomorrow">Mañana</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.category || filters.location || filters.date) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-400">Filtros activos:</span>
          {filters.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
              {categories.find(c => c.value === filters.category)?.label}
              <button
                onClick={() => handleFilterChange('category', '')}
                className="ml-1 hover:bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500 text-white text-sm rounded-full">
              {locations.find(l => l.value === filters.location)?.label}
              <button
                onClick={() => handleFilterChange('location', '')}
                className="ml-1 hover:bg-purple-600 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            </span>
          )}
          {filters.date && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
              {filters.date === 'today' ? 'Hoy' : 
               filters.date === 'tomorrow' ? 'Mañana' :
               filters.date === 'week' ? 'Esta semana' : 'Este mes'}
              <button
                onClick={() => handleFilterChange('date', '')}
                className="ml-1 hover:bg-green-600 rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
