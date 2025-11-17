import { Suspense } from 'react';
import { Metadata } from 'next';
import { EventoContent } from '@/components/evento-content';
import { EventoSkeleton } from '@/components/evento-skeleton';
import { API_ENDPOINTS } from '@/lib/config';
import type { Event } from '@/types/events';
import { notFound } from 'next/navigation';

// ISR con revalidación solo on-demand (cuando se actualiza el evento)
// false = cache indefinido, solo se regenera con revalidatePath()
export const revalidate = false;

// Habilitar generación estática incremental
export const dynamicParams = true;

// Generar rutas estáticas para los eventos más populares en build time
export async function generateStaticParams() {
  try {
    const res = await fetch(API_ENDPOINTS.allEvents, {
      cache: 'no-store', // No cachear durante build, siempre obtener datos frescos
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
} // Server Component que obtiene los datos
async function getEvento(id: string): Promise<Event | null> {
  try {
    const res = await fetch(API_ENDPOINTS.publicEventById(id), {
      cache: 'force-cache', // Cache indefinido, solo se invalida con revalidatePath()
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

// Generar metadatos dinámicos para Open Graph
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvento(id);

  if (!event) {
    return {
      title: 'Evento no encontrado',
      description: 'El evento que buscas no existe',
    };
  }

  // Obtener la primera imagen del evento
  const eventImage = event.imagenes_evento?.[0]?.url || '/icon-ticketeate.png';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ticketeate.com';
  const eventUrl = `${baseUrl}/evento/${id}`;

  // Obtener la fecha del primer evento programado
  const eventDate = event.fechas_evento?.[0]?.fecha_hora;
  const formattedDate = eventDate
    ? new Date(eventDate).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Próximamente';

  // Obtener categoría del evento
  const category = event.evento_categorias?.[0]?.categoriaevento?.nombre || 'Evento';

  return {
    title: event.titulo,
    description: event.descripcion || `Compra entradas para ${event.titulo} en Ticketeate`,
    keywords: [category, 'evento', 'entradas', event.ubicacion].filter(Boolean),
    openGraph: {
      title: event.titulo,
      description:
        event.descripcion ||
        `Compra entradas para ${event.titulo} en Ticketeate - ${formattedDate}`,
      type: 'website',
      url: eventUrl,
      images: [
        {
          url: eventImage,
          width: 1200,
          height: 630,
          alt: event.titulo,
          type: 'image/jpeg',
        },
        {
          url: eventImage,
          width: 800,
          height: 600,
          alt: event.titulo,
          type: 'image/jpeg',
        },
      ],
      siteName: 'Ticketeate',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.titulo,
      description:
        event.descripcion ||
        `Compra entradas para ${event.titulo} en Ticketeate - ${formattedDate}`,
      images: [eventImage],
    },
  };
}

export default async function EventoPage({ params }: { params: Promise<{ id: string }> }) {
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
