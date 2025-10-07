import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ViewCountResult {
  success: boolean;
  message: string;
  counted: boolean;
  totalViews?: number;
}

interface ViewCountData {
  views: number;
  redisViews?: number;
  dbViews?: number;
  source: string;
}

// Hook para obtener el conteo de views usando TanStack Query
export function useViewCount(eventId: string | undefined) {
  return useQuery({
    queryKey: ['view-count', eventId],
    queryFn: async (): Promise<ViewCountData> => {
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      const response = await fetch(`/api/views/${eventId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get view count');
      }

      const data: ViewCountData = await response.json();
      return data;
    },
    enabled: Boolean(eventId),
    staleTime: 5 * 60 * 1000, // 5 minutos - los datos se consideran frescos por 5 minutos
    refetchInterval: 5 * 60 * 1000, // Revalidar cada 5 minutos
    refetchOnWindowFocus: true, // Revalidar cuando la ventana recupera el foco
    refetchOnReconnect: true, // Revalidar cuando se reconecta a internet
  });
}

// Hook para contar una nueva vista
export function useCountView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string): Promise<ViewCountResult> => {
      const response = await fetch(`/api/views/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to count view');
      }

      const result: ViewCountResult = await response.json();
      return result;
    },
    onSuccess: (result, eventId) => {
      // Invalidar la query de view count para que se actualice
      queryClient.invalidateQueries({ queryKey: ['view-count', eventId] });
    },
    onError: (error) => {
      console.error('Error counting view:', error);
    },
  });
}
