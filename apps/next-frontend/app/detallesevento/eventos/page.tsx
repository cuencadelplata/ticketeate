import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CalendarDays, MapPin, Users, Plus, Search, Edit, Trash2, Share2 } from 'lucide-react';

// Datos de ejemplo - en una app real vendrían de una API/base de datos
const events = [
  {
    id: 1,
    title: 'Conferencia Tech 2024',
    date: '2024-03-15',
    location: 'Centro de Convenciones',
    attendees: 450,
    status: 'active',
    image: '/tech-conference.png',
  },
  {
    id: 2,
    title: 'Festival de Música Indie',
    date: '2024-04-20',
    location: 'Parque Central',
    attendees: 1200,
    status: 'active',
    image: '/vibrant-music-festival.png',
  },
  {
    id: 3,
    title: 'Workshop de Diseño UX',
    date: '2024-02-28',
    location: 'Coworking Space',
    attendees: 85,
    status: 'completed',
    image: '/ux-design-workshop.png',
  },
  {
    id: 4,
    title: 'Maratón Benéfica',
    date: '2024-05-10',
    location: 'Ciudad',
    attendees: 800,
    status: 'draft',
    image: '/charity-marathon.jpg',
  },
];

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mis Eventos</h1>
            <p className="text-muted-foreground mt-2">Gestiona todos tus eventos desde aquí</p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/crear">
              <Plus className="w-4 h-4 mr-2" />
              Crear Evento
            </Link>
          </Button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Buscar eventos..." className="pl-10" />
          </div>
        </div>

        {/* Grid de eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img
                  src={event.image || '/placeholder.svg'}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <Badge
                  className={`absolute top-2 right-2 ${
                    event.status === 'active'
                      ? 'bg-primary'
                      : event.status === 'completed'
                        ? 'bg-muted'
                        : 'bg-accent'
                  }`}
                >
                  {event.status === 'active'
                    ? 'Activo'
                    : event.status === 'completed'
                      ? 'Completado'
                      : 'Borrador'}
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {new Date(event.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    {event.attendees} asistentes
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/detallesevento/eventos/${event.id}`}>Ver Detalles</Link>
                  </Button>

                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
