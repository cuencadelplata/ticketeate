import Image from 'next/image';
import { Calendar, MapPin, Users, Clock, Music, Palette, Users2 } from 'lucide-react';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  category: 'social' | 'cultural' | 'musica';
  price: string;
  capacity: number;
  availableTickets: number;
  organizer: string;
}

interface EventCardProps {
  event: Event;
}

const categoryIcons = {
  social: Users2,
  cultural: Palette,
  musica: Music,
};

const categoryColors = {
  social: 'bg-blue-500',
  cultural: 'bg-purple-500',
  musica: 'bg-green-500',
};

const categoryLabels = {
  social: 'Social',
  cultural: 'Cultural',
  musica: 'Música en Vivo',
};

export function EventCard({ event }: EventCardProps) {
  const CategoryIcon = categoryIcons[event.category];
  const categoryColor = categoryColors[event.category];
  const categoryLabel = categoryLabels[event.category];

  return (
    <div className="group cursor-pointer overflow-hidden rounded-lg bg-[#1a1f2e] transition-all hover:scale-105 hover:bg-[#252a3a] shadow-lg hover:shadow-xl">
      <div className="relative h-48 overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.name}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
            <CategoryIcon className="h-16 w-16 text-white/70" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute left-4 top-4">
          <span className={`rounded-full ${categoryColor} px-3 py-1 text-xs font-medium text-white`}>
            {categoryLabel}
          </span>
        </div>
        
        {/* Price Badge */}
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-black/70 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            {event.price}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Date and Time */}
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="h-4 w-4" />
          <span>{event.date}</span>
          <span>•</span>
          <Clock className="h-4 w-4" />
          <span>{event.time}</span>
        </div>

        {/* Title */}
        <h3 className="mb-3 line-clamp-2 text-xl font-semibold text-white group-hover:text-green-400 transition-colors">
          {event.name}
        </h3>

        {/* Location */}
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-gray-300">
          {event.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {event.organizer.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-gray-400">
              {event.organizer}
            </span>
          </div>

          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Users className="h-4 w-4" />
            <span>{event.availableTickets} disponibles</span>
          </div>
        </div>
      </div>
    </div>
  );
}
