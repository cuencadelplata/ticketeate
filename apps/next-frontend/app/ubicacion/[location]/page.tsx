'use client';

import { Button } from '@/components/ui/button';
import { Clock, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { locations } from '../../../data/locations';

export default function LocationPage() {
  const params = useParams();
  const locationId = params.location as string;

  const location = locations.find(loc => loc.location === locationId);

  if (!location) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b] p-6 text-white md:p-12">
        <h1 className="mb-4 text-4xl font-bold">Localidad no encontrada</h1>
        <p className="mb-8">No pudimos encontrar la localidad que estás buscando.</p>
        <Link href="/">
          <Button>Volver a la página principal</Button>
        </Link>
      </div>
    );
  }

  const currentTime = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 z-0">
        <Image
          src={location.image || '/placeholder.svg'}
          alt={location.name}
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />

      <div className="relative z-20 flex min-h-screen flex-col justify-center p-6 md:p-12">
        <div className="max-w-lg">
          <div className="mb-8 flex items-center">
            <MapPin className="h-10 w-10 text-white" />
          </div>

          <div className="mb-2 text-lg text-white/70">Qué está pasando en</div>

          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">{location.name}</h1>

          <div className="mb-8 flex items-center gap-2 text-white/70">
            <Clock className="h-4 w-4" />
            <span>
              {currentTime} {location.timezone}
            </span>
          </div>

          <p className="mb-8 text-lg text-white/90">{location.description}</p>

          <Button className="rounded-full bg-white px-8 py-6 text-lg text-black hover:bg-white/90">
            Suscribirse
          </Button>
        </div>
      </div>
    </div>
  );
}
