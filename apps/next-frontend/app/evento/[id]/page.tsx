'use client';

import { EventoContent } from '@/components/evento-content';
import { EventoSkeleton } from '@/components/evento-skeleton';
import { usePublicEvent } from '@/hooks/use-events';
import { useParams } from 'next/navigation';

export default function EventoPage() {
  const params = useParams();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params?.id[0]
        : undefined;
  
  const { data: event, isLoading, error } = usePublicEvent(id);

  if (isLoading) {
    return <EventoSkeleton />;
  }

  if (error || !event) {
    return (
      <main className="min-h-screen py-16">
        <div className="fixed left-0 top-0 z-5 h-full w-full bg-gradient-to-b from-neutral-950 to-neutral-900" />
        <div className="relative z-20 min-h-screen text-zinc-200">
          <div className="mx-auto max-w-[68rem] space-y-2 px-20 pb-3 pt-10">
            <div className="text-red-200">No se pudo cargar el evento.</div>
          </div>
        </div>
      </main>
    );
  }

  return <EventoContent event={event} eventId={id} />;
}
