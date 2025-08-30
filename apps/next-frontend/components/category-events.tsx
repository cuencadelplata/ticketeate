import { EventCard, Event } from './event-card';
import { Music, Palette, Users2 } from 'lucide-react';

interface CategoryEventsProps {
  events: Event[];
}

export function CategoryEvents({ events }: CategoryEventsProps) {
  const categories = [
    { key: 'social', label: 'Eventos Sociales', icon: Users2, color: 'from-blue-500 to-blue-600' },
    {
      key: 'cultural',
      label: 'Eventos Culturales',
      icon: Palette,
      color: 'from-purple-500 to-purple-600',
    },
    { key: 'musica', label: 'Música en Vivo', icon: Music, color: 'from-green-500 to-green-600' },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">Explora por Categoría</h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Encuentra el tipo de evento que más te interese
          </p>
        </div>

        <div className="space-y-16">
          {categories.map(category => {
            const categoryEvents = events.filter(event => event.category === category.key);
            const IconComponent = category.icon;

            if (categoryEvents.length === 0) return null;

            return (
              <div key={category.key} className="space-y-8">
                {/* Category Header */}
                <div className="flex items-center gap-4">
                  <div className={`rounded-full bg-gradient-to-r p-3 ${category.color}`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{category.label}</h3>
                    <p className="text-gray-400">
                      {categoryEvents.length} evento{categoryEvents.length !== 1 ? 's' : ''}{' '}
                      disponible{categoryEvents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Events Grid for this category */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categoryEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
