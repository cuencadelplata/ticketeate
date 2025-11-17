import { useQuery } from '@tanstack/react-query';

export function useGetMyColaboradorEvents() {
  return useQuery({
    queryKey: ['myColaboradorEvents'],
    queryFn: async () => {
      const response = await fetch('/api/colaborador/mis-eventos', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener eventos');
      }

      const data = await response.json();
      return data.eventos;
    },
  });
}
