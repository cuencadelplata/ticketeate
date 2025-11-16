import { useQuery } from '@tanstack/react-query';

interface EventStats {
  totalInvitados: number;
  totalInscriptos: number;
}

export function useEventStats(eventId: string) {
  const { data, isLoading, error, isError } = useQuery<EventStats>({
    queryKey: ['event-stats', eventId],
    queryFn: async (): Promise<EventStats> => {
      try {
        // Obtener invitados
        const invitadosRes = await fetch(`/api/administrador/invitados?eventId=${eventId}`);
        let totalInvitados = 0;
        if (invitadosRes.ok) {
          const invitadosData = await invitadosRes.json();
          totalInvitados = invitadosData.data.invitados.length;
        }

        // Obtener inscriptos
        const inscriptosRes = await fetch(`/api/administrador/inscripciones?eventId=${eventId}`);
        let totalInscriptos = 0;
        if (inscriptosRes.ok) {
          const inscriptosData = await inscriptosRes.json();
          totalInscriptos = inscriptosData.data.estadisticas.totalInscritos;
        }

        return {
          totalInvitados,
          totalInscriptos,
        };
      } catch (error) {
        console.error('Error loading event stats:', error);
        throw error;
      }
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
  });

  return {
    data,
    isLoading,
    error,
    isError,
  };
}
