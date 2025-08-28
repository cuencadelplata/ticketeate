import Image from 'next/image';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { EventsGrid } from '@/components/events-grid';
import { CategoryEvents } from '@/components/category-events';

// Datos de ejemplo para eventos (los mismos que en EventsGrid)
const sampleEvents = [
  {
    id: '1',
    name: 'Fiesta de Verano en la Playa',
    description: 'Una noche mágica con música electrónica, bebidas tropicales y la mejor vibra del verano. Disfruta del atardecer mientras bailas al ritmo de los mejores DJs.',
    date: '15 Dic 2024',
    time: '20:00',
    location: 'Playa del Carmen, Cancún',
    imageUrl: '/api/placeholder/400/300',
    category: 'social' as const,
    price: 'Gratis',
    capacity: 200,
    availableTickets: 150,
    organizer: 'Beach Club'
  },
  {
    id: '2',
    name: 'Exposición de Arte Contemporáneo',
    description: 'Descubre las obras más innovadoras de artistas emergentes latinoamericanos. Una experiencia cultural única que combina pintura, escultura y arte digital.',
    date: '20 Dic 2024',
    time: '18:00',
    location: 'Museo de Arte Moderno, CDMX',
    imageUrl: '/api/placeholder/400/300',
    category: 'cultural' as const,
    price: '$150',
    capacity: 100,
    availableTickets: 75,
    organizer: 'Arte Latino'
  },
  {
    id: '3',
    name: 'Concierto de Rock Indie',
    description: 'Las mejores bandas independientes del país se reúnen para una noche épica de rock alternativo. No te pierdas esta experiencia musical única.',
    date: '22 Dic 2024',
    time: '21:00',
    location: 'Foro Sol, CDMX',
    imageUrl: '/api/placeholder/400/300',
    category: 'musica' as const,
    price: '$300',
    capacity: 5000,
    availableTickets: 3200,
    organizer: 'Rock Nation'
  },
  {
    id: '4',
    name: 'Networking Empresarial',
    description: 'Conecta con profesionales de tu industria en un ambiente relajado. Charlas inspiradoras, networking de calidad y oportunidades de negocio.',
    date: '25 Dic 2024',
    time: '19:00',
    location: 'Centro de Convenciones, Monterrey',
    imageUrl: '/api/placeholder/400/300',
    category: 'social' as const,
    price: '$200',
    capacity: 150,
    availableTickets: 120,
    organizer: 'Business Connect'
  },
  {
    id: '5',
    name: 'Festival de Cine Independiente',
    description: 'Proyecciones de películas independientes nacionales e internacionales. Charlas con directores, talleres de cinematografía y mucho más.',
    date: '28 Dic 2024',
    time: '17:00',
    location: 'Cineteca Nacional, CDMX',
    imageUrl: '/api/placeholder/400/300',
    category: 'cultural' as const,
    price: '$100',
    capacity: 300,
    availableTickets: 250,
    organizer: 'Cine Indie MX'
  },
  {
    id: '6',
    name: 'Concierto de Jazz al Aire Libre',
    description: 'Disfruta de una velada mágica con los mejores músicos de jazz del país. Música relajante bajo las estrellas en un ambiente íntimo y elegante.',
    date: '30 Dic 2024',
    time: '20:30',
    location: 'Jardín Botánico, Guadalajara',
    imageUrl: '/api/placeholder/400/300',
    category: 'musica' as const,
    price: '$180',
    capacity: 200,
    availableTickets: 180,
    organizer: 'Jazz Club'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-24">
        <div className="space-y-8 pt-12 text-center">
          <div className="flex items-center justify-center">
            <Image src="/wordmark-light.png" alt="Ticketeate" width={350} height={200} />
          </div>
          <div className="flex items-center justify-center">
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Crea, gestiona y vende entradas en minutos. La plataforma más completa para la gestión
              de eventos.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 pt-12">
          <SignedOut>
            <SignInButton>
              <button className="font-base h-6 cursor-pointer rounded-full bg-green-800 px-4 text-sm text-white sm:h-10 sm:px-5 sm:text-base">
                Inicia sesión
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="font-base h-6 cursor-pointer rounded-full bg-green-950 px-4 text-sm text-white sm:h-10 sm:px-5 sm:text-base">
                Registrate
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* Grilla de Eventos con Filtros */}
      <EventsGrid 
        title="Eventos Destacados" 
        subtitle="Descubre los mejores eventos sociales, culturales y musicales de la temporada"
        showFilters={true}
      />

      {/* Eventos por Categoría */}
      <CategoryEvents events={sampleEvents} />
    </main>
  );
}
