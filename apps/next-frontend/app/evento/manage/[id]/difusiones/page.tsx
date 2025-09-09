'use client';

import { useParams } from 'next/navigation';
import { useEvent } from '@/hooks/use-events';

export default function ManageEventDiffusionsPage() {
  const params = useParams();
  const id =
    typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params?.id[0] : '';
  const { data: event, isLoading, error } = useEvent(id);

  if (isLoading) return <div className="p-4">Cargando difusiones...</div>;
  if (error || !event) return <div className="p-4">No se pudo cargar el evento.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Difusiones</h1>
      <p className="mt-2 text-sm opacity-80">
        Pronto podrás configurar campañas y compartir enlaces.
      </p>
    </div>
  );
}
