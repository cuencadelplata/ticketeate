'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Brain,
  Palette,
  Globe,
  Activity,
  Flower,
  Bitcoin,
  MapPin,
  Calendar,
  Clock,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { locations } from '../../data/locations';
// Card import removed because it's unused
import { toast } from 'sonner';

type PublicEvent = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  location: string;
  imageUrl?: string;
  pricingType: string;
  minPrice: number;
  availableTickets: number;
  displayDate: string;
  displayTime: string;
  producer: {
    name: string;
  };
  productora?: {
    name: string;
    profileImage?: string;
  };
};

export default function Home() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Cargar eventos
  const loadPublicEvents = async (location?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (location) params.append('location', location);
      params.append('limit', '12');

      const response = await fetch(`/api/discover?${params}`);
      if (!response.ok) {
        throw new Error('Error al cargar eventos');
      }

      const data = await response.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Error loading public events:', error);
      toast.error('Error al cargar los eventos públicos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPublicEvents();
  }, []);

  const handleLocationFilter = (location: string) => {
    setSelectedLocation(location);
    loadPublicEvents(location);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] p-6 text-white md:p-24">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-4xl font-bold md:text-4xl">Descubrir eventos</h1>
        <p className="mb-16 max-w-3xl text-lg text-gray-300">
          Explora eventos populares cerca de ti, navega por categoría o echa un vistazo a algunos de
          los excelentes calendarios comunitarios.
        </p>

        {/* Sección de Eventos Próximos */}
        <div className="mb-12">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold md:text-3xl">Eventos próximos</h2>
            {selectedLocation && (
              <button
                onClick={() => {
                  setSelectedLocation(null);
                  loadPublicEvents();
                }}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Ver todos los eventos
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="mb-4 h-48 rounded-lg bg-gray-700"></div>
                  <div className="mb-2 h-4 rounded bg-gray-700"></div>
                  <div className="h-4 w-3/4 rounded bg-gray-700"></div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-500" />
              <h3 className="mb-2 text-xl font-semibold text-gray-300">
                No hay eventos disponibles
              </h3>
              <p className="text-gray-400">
                {selectedLocation
                  ? `No se encontraron eventos en ${selectedLocation}`
                  : 'Vuelve pronto para ver nuevos eventos'}
              </p>
            </div>
          )}
        </div>

        <div className="mb-12">
          <h2 className="mb-8 text-2xl font-bold md:text-3xl">Explorar por categoría</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <CategoryCard
              icon={<Brain className="h-8 w-8 text-pink-400" />}
              title="IA"
              count="1 mil eventos"
            />
            <CategoryCard
              icon={<Palette className="h-8 w-8 text-yellow-400" />}
              title="Arte y cultura"
              count="996 eventos"
            />
            <CategoryCard
              icon={<Globe className="h-8 w-8 text-green-400" />}
              title="Clima"
              count="651 eventos"
            />
            <CategoryCard
              icon={<Activity className="h-8 w-8 text-orange-400" />}
              title="Fitness"
              count="553 eventos"
            />
            <CategoryCard
              icon={<Flower className="h-8 w-8 text-teal-400" />}
              title="Bienestar"
              count="1 mil eventos"
            />
            <CategoryCard
              icon={<Bitcoin className="h-8 w-8 text-purple-400" />}
              title="Cripto"
              count="1 mil eventos"
            />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-8 text-2xl font-bold md:text-3xl">Productoras destacadas</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ProducerCard
              logo="/placeholder.svg?height=40&width=40"
              title="Reading Rhythms Global"
              description="Not a book club. A reading party. Read with friends to live music ..."
            />
            <ProducerCard
              logo="/placeholder.svg?height=40&width=40"
              title="ADPList"
              description="Your one-stop-shop for all things happening in the ADPList..."
            />
            <ProducerCard
              logo="/placeholder.svg?height=40&width=40"
              title="Build Club"
              location="Sydney"
              description="The best place in the world to learn AI. Curated with..."
            />
            <ProducerCard
              logo="/placeholder.svg?height=40&width=40"
              title="Her Workplace"
              description="The career network for the next generation of women and non-..."
            />
            <ProducerCard
              logo="/placeholder.svg?height=40&width=40"
              title="South Park Commons"
              description="South Park Commons helps you get from -1 to 0. To learn more ..."
            />
            <ProducerCard
              logo="/placeholder.svg?height=40&width=40"
              title="The GenAI Collective"
              description="The US's largest AI community: 25,000+ founders, researchers,..."
            />
            <ProducerCard
              logo="/placeholder.svg?height=40&width=40"
              title="Generative AI San Francisco and Bay Area"
              location="San Francisco"
              description=""
            />
          </div>
        </div>

        <div className="mb-12">
          <h2 className="mb-8 text-2xl font-bold md:text-3xl">Localidades</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locations.map(location => (
              <LocationCard
                key={location.location}
                _loc={location.location}
                name={location.name}
                eventCount={location.eventCount}
                onSelect={() => handleLocationFilter(location.name)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CategoryCardProps {
  icon: React.ReactNode;
  title: string;
  count: string;
}

function CategoryCard({ icon, title, count }: CategoryCardProps) {
  return (
    <div className="cursor-pointer rounded-lg bg-[#1a1f2e] p-6 transition-all hover:bg-[#252a3a]">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-1 text-xl font-semibold">{title}</h3>
      <p className="text-sm text-gray-400">{count}</p>
    </div>
  );
}

interface ProducerCardProps {
  logo: string;
  title: string;
  description: string;
  location?: string;
}

function ProducerCard({ logo, title, description, location }: ProducerCardProps) {
  return (
    <div className="relative rounded-lg bg-[#1a1f2e] p-6">
      <Button
        variant="secondary"
        className="absolute right-6 top-6 bg-[#2a303c] text-sm text-gray-300 hover:bg-[#353b4a]"
      >
        Suscribirse
      </Button>

      <div className="mb-4">
        <Image
          src={logo || '/placeholder.svg'}
          alt={`${title} logo`}
          width={40}
          height={40}
          className="rounded"
        />
      </div>

      <h3 className="mb-1 text-xl font-semibold">{title}</h3>

      {location && (
        <div className="mb-2 flex items-center gap-1 text-sm text-gray-400">
          <MapPin className="h-3 w-3" />
          <span>{location}</span>
        </div>
      )}

      <p className="line-clamp-2 text-sm text-gray-400">{description}</p>
    </div>
  );
}

// Componente para mostrar eventos individuales
interface EventCardProps {
  event: PublicEvent;
}

function EventCard({ event }: EventCardProps) {
  return (
    <div className="group cursor-pointer overflow-hidden rounded-lg bg-[#1a1f2e] transition-all hover:scale-105 hover:bg-[#252a3a]">
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
            <Calendar className="h-16 w-16 text-white/70" />
          </div>
        )}
        <div className="absolute right-4 top-4">
          {event.pricingType === 'FREE' ? (
            <span className="rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
              Gratis
            </span>
          ) : (
            <span className="rounded-full bg-purple-500 px-2 py-1 text-xs font-medium text-white">
              ${event.minPrice}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{event.displayDate}</span>
          <span>•</span>
          <span>{event.displayTime}</span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-white">{event.name}</h3>

        <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{event.location}</span>
        </div>

        <p className="mb-4 line-clamp-2 text-sm text-gray-300">{event.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {event.productora?.profileImage ? (
              <Image
                src={event.productora.profileImage}
                alt={event.productora.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-gray-600"></div>
            )}
            <span className="text-sm text-gray-400">
              {event.productora?.name || event.producer.name}
            </span>
          </div>

          {event.availableTickets > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Users className="h-4 w-4" />
              <span>{event.availableTickets} disponibles</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface LocationCardProps {
  name: string;
  eventCount: string;
  onSelect?: () => void;
}

function LocationCard({ name, eventCount, onSelect }: LocationCardProps) {
  return (
    <div onClick={onSelect} className="block">
      <div className="cursor-pointer rounded-lg bg-[#1a1f2e] p-6 transition-all hover:bg-[#252a3a]">
        <div className="mb-4">
          <MapPin className="h-8 w-8 text-blue-400" />
        </div>
        <h3 className="mb-1 text-xl font-semibold">{name}</h3>
        <p className="text-sm text-gray-400">{eventCount}</p>
      </div>
    </div>
  );
}
