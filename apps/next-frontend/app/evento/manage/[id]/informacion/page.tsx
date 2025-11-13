'use client';

import { useParams } from 'next/navigation';
import { useEvent } from '@/hooks/use-events';

export default function ManageEventInfoPage() {
  const params = useParams();
  const id =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : '';
  const { data: event, isLoading, error } = useEvent(id);

  if (isLoading) return <div className="p-4">Cargando datos del evento...</div>;
  if (error || !event) return <div className="p-4">No se pudo cargar el evento.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Información del evento</h1>
      <div className="mt-2 text-sm opacity-80">ID: {event.eventoid}</div>
      <div className="mt-4 space-y-2">
        <div>
          <span className="font-medium">Título:</span> {event.titulo}
        </div>
        {event.descripcion && (
          <div>
            <span className="font-medium">Descripción:</span> {event.descripcion}
          </div>
        )}
        {event.ubicacion && (
          <div>
            <span className="font-medium">Ubicación:</span> {event.ubicacion}
          </div>
        )}
      </div>
    </div>
  );
}
