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

  // Debug temporal - solo mostrar si hay categorías
  if (categorias && categorias.length > 0) {
    console.log('EventCard categorías:', categorias, 'category:', category);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-stone-800 shadow-md border border-gray-200 dark:border-stone-700 h-[500px] flex flex-col"
    >
      {/* Imagen del evento */}
      <div className="group relative h-56 overflow-hidden flex-shrink-0">
        <Image
          src={image}
          alt={title}
          width={800}
          height={320}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Badge de disponibilidad */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
          >
            <span className="text-xs">{badge.icon}</span>
            {badge.text}
          </span>
        </div>

        {/* Badge de precio */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
              isFree ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
            }`}
          >
            <Ticket className="h-3 w-3" />
            {price}
          </span>
        </div>
      </div>

      {/* Contenido de la card */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Título */}
        <h3 className="text-lg font-bold text-stone-900 dark:text-white line-clamp-2 mb-2">
          {title}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-gray-600 dark:text-stone-300 line-clamp-2 mb-3">{description}</p>

        {/* Información del evento */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-stone-400">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{date}</span>
            {totalDates > 1 && (
              <span className="text-xs bg-gray-100 dark:bg-stone-700 px-2 py-0.5 rounded-full flex-shrink-0">
                +{totalDates - 1} fechas
              </span>
            )}
          </div>

          {category2 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-stone-400">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{category2}</span>
            </div>
          )}

          {/* Fechas adicionales */}
          {fechasAdicionales.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-stone-400">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs truncate">
                También: {fechasAdicionales.slice(0, 2).join(', ')}
                {fechasAdicionales.length > 2 && ` +${fechasAdicionales.length - 2} más`}
              </span>
            </div>
          )}
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categorias && categorias.length > 0 ? (
            categorias.slice(0, 2).map((cat, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-medium text-orange-800 dark:text-orange-200"
              >
                <Tag className="h-3 w-3" />
                <span className="truncate">{cat}</span>
              </span>
            ))
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-stone-700 px-3 py-1 text-xs font-medium text-stone-600 dark:text-stone-400">
              <Tag className="h-3 w-3" />
              <span className="truncate">{category}</span>
            </span>
          )}
          {categorias && categorias.length > 2 && (
            <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-stone-700 px-3 py-1 text-xs font-medium text-stone-600 dark:text-stone-400">
              +{categorias.length - 2} más
            </span>
          )}
        </div>

        {/* Botón de compra - siempre al final */}
        <div className="mt-auto">
          <Link href={href || '#'} className="block">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-orange-600 px-3 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-orange-700 hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Ticket className="h-4 w-4" />
              {isFree ? 'Inscribirse' : `Comprar ${price}`}
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
