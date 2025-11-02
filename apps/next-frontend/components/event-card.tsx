import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket, Tag, Clock } from 'lucide-react';

type EventCardProps = {
  title: string;
  description: string;
  price: string;
  date: string;
  image: string;
  category: string;
  category2: string;
  disponibilidad: string;
  href?: string;
  // Nuevos campos
  isFree?: boolean;
  categorias?: string[];
  fechasAdicionales?: string[];
  totalDates?: number;
};

function getDisponibilidadBadge(disponibilidad: string) {
  if (disponibilidad.toLowerCase().includes('cancelado')) {
    return {
      text: 'Cancelado',
      className: 'bg-red-500 text-white',
      icon: '🔴',
    };
  }
  if (disponibilidad.toLowerCase().includes('completado')) {
    return {
      text: 'Completado',
      className: 'bg-gray-500 text-white',
      icon: '⚫',
    };
  }
  if (disponibilidad.toLowerCase().includes('disponible')) {
    return {
      text: 'Disponible',
      className: 'bg-green-500 text-white',
      icon: '🟢',
    };
  }
  if (disponibilidad.toLowerCase().includes('oculto')) {
    return {
      text: 'Oculto',
      className: 'bg-yellow-500 text-white',
      icon: '🟡',
    };
  }
  return {
    text: disponibilidad,
    className: 'bg-gray-500 text-white',
    icon: '⚪',
  };
}

export function EventCard({
  title,
  description,
  price,
  date,
  image,
  category,
  category2,
  disponibilidad,
  href,
  isFree = false,
  categorias = [],
  fechasAdicionales = [],
  totalDates = 1,
}: EventCardProps) {
  const badge = getDisponibilidadBadge(disponibilidad);

  return (
    <Link href={href || '#'} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-xl bg-white dark:bg-stone-900 shadow-sm hover:shadow-xl border border-gray-200 dark:border-stone-800 transition-all duration-300 h-full flex flex-col"
      >
        {/* Imagen del evento con altura fija */}
        <div className="relative w-full h-96 overflow-hidden flex-shrink-0">
          <Image
            src={image}
            alt={title}
            width={800}
            height={600}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay con gradiente más sutil */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />

          {/* Badge de precio en la esquina inferior izquierda */}
          <div className="absolute bottom-3 left-3">
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold backdrop-blur-sm ${
                isFree
                  ? 'bg-green-500/90 text-white'
                  : 'bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white'
              }`}
            >
              {price}
            </span>
          </div>

          {/* Badge de múltiples fechas en la esquina superior derecha */}
          {totalDates > 1 && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium bg-black/60 backdrop-blur-sm text-white">
                <Calendar className="h-3 w-3" />
                {totalDates} fechas
              </span>
            </div>
          )}
        </div>

        {/* Contenido de la card */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Categoría pequeña */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
              {category}
            </span>
          </div>

          {/* Título */}
          <h3 className="text-base font-semibold text-stone-900 dark:text-white line-clamp-2 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {title}
          </h3>

          {/* Fecha del evento */}
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-stone-400 mb-2">
            <Calendar className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{date}</span>
          </div>

          {/* Ubicación */}
          {category2 && (
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-stone-400">
              <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{category2}</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
