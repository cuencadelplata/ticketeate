import { Suspense } from 'react';
import { EventoContent } from '@/components/evento-content';
import { EventoSkeleton } from '@/components/evento-skeleton';
import { API_ENDPOINTS } from '@/lib/config';
import type { Event } from '@/types/events';
import { notFound } from 'next/navigation';

// Configuración ISR: regenerar cada 60 segundos
export const revalidate = 60;

// Habilitar generación estática incremental
export const dynamicParams = true;

// Generar rutas estáticas para los eventos más populares en build time
export async function generateStaticParams() {
  try {
    const res = await fetch(API_ENDPOINTS.allEvents, {
      next: { revalidate: 3600 }, // Cache por 1 hora
    });

    if (!res.ok) {
      console.error('Error fetching events for static params');
      return [];
    }

    const data = await res.json();
    const events = data.events || [];

    // Pre-generar las primeras 10 páginas
    return events.slice(0, 10).map((event: any) => ({
      id: event.eventoid.toString(),
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

// Server Component que obtiene los datos
async function getEvento(id: string): Promise<Event | null> {
  try {
    const res = await fetch(API_ENDPOINTS.publicEventById(id), {
      next: { revalidate: 60 }, // Revalidar cada 60 segundos
    });

    if (!res.ok) {
      console.error(`Error fetching event ${id}: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.event;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

export default async function EventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // En Next.js 15, params es una Promise y debe ser unwrapped
  const { id } = await params;
  const event = await getEvento(id);

  if (!event) {
    notFound();
  }

  return (
    <Suspense fallback={<EventoSkeleton />}>
      <EventoContent event={event} eventId={id} />
    </Suspense>
  );
}
