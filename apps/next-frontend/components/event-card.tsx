import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket } from 'lucide-react';

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
};

function getDisponibilidadBadge(disponibilidad: string) {
  if (disponibilidad.toLowerCase().includes('agotada')) {
    return {
      text: 'Agotado',
      className: 'bg-red-500 text-white',
      icon: '🔴'
    };
  }
  if (disponibilidad.toLowerCase().includes('disponible')) {
    return {
      text: 'Disponible',
      className: 'bg-green-500 text-white',
      icon: '🟢'
    };
  }
  return {
    text: disponibilidad,
    className: 'bg-gray-500 text-white',
    icon: '⚪'
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
}: EventCardProps) {
  const badge = getDisponibilidadBadge(disponibilidad);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
    >
      {/* Imagen del evento */}
      <div className="relative h-48 overflow-hidden">
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
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>
            <span className="text-xs">{badge.icon}</span>
            {badge.text}
          </span>
        </div>
      </div>

      {/* Contenido de la card */}
      <div className="p-6 space-y-4">
        {/* Título */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {title}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {description}
        </p>

        {/* Información del evento */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{date}</span>
          </div>
          
          {category2 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{category2}</span>
            </div>
          )}
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full bg-orange-100 dark:bg-orange-900/30 px-3 py-1 text-xs font-medium text-orange-800 dark:text-orange-200">
            {category}
          </span>
        </div>

        {/* Botón de compra */}
        <Link href={href || '#'} className="block">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:bg-orange-700 hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Ticket className="h-4 w-4" />
            Comprar desde {price}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}
