import { useQuery } from '@tanstack/react-query';

interface Invitado {
  id: string;
  nombre: string;
  email: string;
  estado: 'pendiente' | 'enviado' | 'reclamado';
  fechaEnvio?: string;
}

export function useInvitados(eventId: string) {
  const { data, isLoading, error, isError } = useQuery<Invitado[]>({
    queryKey: ['invitados', eventId],
    queryFn: async (): Promise<Invitado[]> => {
      const response = await fetch(`/api/administrador/invitados?eventId=${eventId}`);
      if (!response.ok) {
        throw new Error('Error al obtener invitados');
      }
      const data = await response.json();
      return data.data.invitados;
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
