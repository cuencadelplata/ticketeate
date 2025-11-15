'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SearchIcon, X } from 'lucide-react';
import { useSearch } from '@/contexts/search-context';
import { useAllEvents } from '@/hooks/use-events';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchEvent {
  title: string;
  image: string;
  price: string;
  category: string;
  eventId: string;
  date: string;
}

export function SearchDropdown() {
  const { searchQuery, setSearchQuery } = useSearch();
  const { data: allEvents = [], isLoading } = useAllEvents();
  const [isOpen, setIsOpen] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<SearchEvent[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mapear eventos a formato de búsqueda
  const searchEvents: SearchEvent[] = React.useMemo(() => {
    return (allEvents || []).map((evt) => {
      const portada = evt.imagenes_evento?.find((i) => i.tipo === 'PORTADA')?.url;
      const primera = evt.imagenes_evento?.[0]?.url;
      const image = portada || primera || '/icon-ticketeate.png';

      const eventDate = evt.fechas_evento?.[0]?.fecha_hora
        ? new Date(evt.fechas_evento[0].fecha_hora)
        : new Date(evt.fecha_creacion || Date.now());
      const date = eventDate.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      });

      const isFree =
        !evt.stock_entrada ||
        evt.stock_entrada.length === 0 ||
        evt.stock_entrada.every((ticket) => Number(ticket.precio) === 0);

      const precios =
        evt.stock_entrada?.map((ticket) => Number(ticket.precio)).filter((p) => p > 0) || [];
      const precioMinimo = precios.length > 0 ? Math.min(...precios) : 0;

      const categoriaPrincipal = evt.evento_categorias?.[0]?.categoriaevento?.nombre || 'Evento';

      return {
        title: evt.titulo,
        image,
        price: isFree ? 'Gratis' : `$${precioMinimo}`,
        category: categoriaPrincipal,
        eventId: evt.eventoid,
        date,
      };
    });
  }, [allEvents]);

  // Filtrar eventos basados en la query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredEvents([]);
      setIsOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = searchEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(query) || event.category.toLowerCase().includes(query),
    );

    setFilteredEvents(filtered.slice(0, 8)); // Limitar a 8 resultados
    setIsOpen(filtered.length > 0);
  }, [searchQuery, searchEvents]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: unknown) => {
      const target = (e as Record<string, unknown>).target;
      if (
        dropdownRef.current &&
        target &&
        typeof target === 'object' &&
        'contains' in dropdownRef.current &&
        !(dropdownRef.current.contains as (node: unknown) => boolean)(target) &&
        inputRef.current &&
        'contains' in inputRef.current &&
        !(inputRef.current.contains as (node: unknown) => boolean)(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleEventClick = () => {
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          placeholder="Buscar eventos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && setIsOpen(true)}
          className="peer h-10 w-full rounded-lg border border-zinc-600 bg-white/10 backdrop-blur-sm px-10 text-sm text-zinc-200 placeholder:text-zinc-400 hover:border-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="h-4 w-4 text-zinc-400" />
        </div>
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-zinc-200 text-zinc-400 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (filteredEvents.length > 0 || (isLoading && searchQuery.trim())) && (
          <>
            {/* Overlay invisible para cerrar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-stone-900 border border-stone-700 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="max-h-96 overflow-y-auto scrollbar-hide">
                {isLoading && searchQuery.trim() && filteredEvents.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-stone-800 rounded-lg h-32 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3">
                      {filteredEvents.map((event) => (
                        <Link
                          key={event.eventId}
                          href={`/evento/${event.eventId}`}
                          onClick={handleEventClick}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="group cursor-pointer bg-stone-800 hover:bg-stone-700 rounded-lg overflow-hidden transition-colors border border-stone-700 hover:border-orange-500/50 flex flex-col h-full"
                          >
                            {/* Imagen */}
                            <div className="relative h-24 w-full overflow-hidden bg-stone-950 flex-shrink-0">
                              <Image
                                src={event.image}
                                alt={event.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              {/* Overlay con precio */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end">
                                <div className="absolute top-2 right-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded">
                                  {event.price}
                                </div>
                              </div>
                            </div>

                            {/* Información */}
                            <div className="p-2 space-y-1 flex flex-col flex-grow">
                              <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-orange-400 transition-colors flex-grow">
                                {event.title}
                              </h3>
                              <div className="flex items-center justify-between text-xs text-stone-400 flex-shrink-0">
                                <span className="line-clamp-1">{event.category}</span>
                                <span className="text-stone-500 whitespace-nowrap ml-1">
                                  {event.date}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>

                    {/* Pie con mensaje "Descubrir más eventos" */}
                    {filteredEvents.length > 0 && (
                      <Link
                        href={`/descubrir?search=${encodeURIComponent(searchQuery)}`}
                        onClick={handleEventClick}
                        className="block bg-stone-800/50 hover:bg-stone-800 text-center py-3 text-sm text-orange-400 hover:text-orange-300 font-medium border-t border-stone-700 transition-colors"
                      >
                        Descubrir más eventos
                      </Link>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>{' '}
      {/* Mensaje cuando no hay resultados */}
      <AnimatePresence>
        {isOpen && searchQuery.trim() && filteredEvents.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-stone-900 border border-stone-700 rounded-lg shadow-xl z-50 p-4 text-center"
          >
            <p className="text-sm text-stone-400">No se encontraron eventos</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
