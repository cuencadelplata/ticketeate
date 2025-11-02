'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign, Music, Wifi, Clock } from 'lucide-react';
import { Button } from '@heroui/react';

export type EventFilter = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  active: boolean;
};

interface EventFiltersBarProps {
  onFilterChange?: (filters: EventFilter[]) => void;
}

export function EventFiltersBar({ onFilterChange }: EventFiltersBarProps) {
  const [filters, setFilters] = useState<EventFilter[]>([
    { id: 'all', label: 'Todos', active: true },
    { id: 'foryou', label: 'Para vos', active: false },
    { id: 'online', label: 'En línea', icon: <Wifi className="h-3.5 w-3.5" />, active: false },
    { id: 'today', label: 'Hoy', icon: <Clock className="h-3.5 w-3.5" />, active: false },
    {
      id: 'weekend',
      label: 'Este fin de semana',
      icon: <Calendar className="h-3.5 w-3.5" />,
      active: false,
    },
    { id: 'free', label: 'Gratis', icon: <DollarSign className="h-3.5 w-3.5" />, active: false },
    { id: 'music', label: 'Música', icon: <Music className="h-3.5 w-3.5" />, active: false },
  ]);

  const handleFilterClick = (filterId: string) => {
    const newFilters = filters.map((filter) => {
      if (filterId === 'all') {
        return { ...filter, active: filter.id === 'all' };
      } else {
        if (filter.id === filterId) {
          return { ...filter, active: !filter.active };
        } else if (filter.id === 'all') {
          return { ...filter, active: false };
        }
        return filter;
      }
    });

    // Si no hay ningún filtro activo (excepto "all"), activamos "all"
    const hasActiveFilter = newFilters.some((f) => f.id !== 'all' && f.active);
    if (!hasActiveFilter) {
      newFilters.find((f) => f.id === 'all')!.active = true;
    }

    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 py-3"
    >
      <div className="max-w-full mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              size="sm"
              variant={filter.active ? 'solid' : 'bordered'}
              className={`
                flex-shrink-0 rounded-full transition-all duration-200
                ${
                  filter.active
                    ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-orange-500 hover:text-orange-600'
                }
              `}
              onClick={() => handleFilterClick(filter.id)}
              startContent={filter.icon}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
