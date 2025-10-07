import { useQuery } from '@tanstack/react-query';

interface ViewsHistoryData {
  chartData: Array<{
    date: string;
    views: number;
    fullDate: string;
  }>;
  totalViews: number;
  totalViewsInPeriod: number;
  averageDailyViews: number;
  maxDailyViews: number;
  minDailyViews: number;
  period: string;
  lastUpdated: string;
}

interface ViewsHistoryResponse {
  success: boolean;
  data: ViewsHistoryData;
}

// Hook para obtener el historial de views usando TanStack Query
export function useViewsHistory(eventId: string | undefined, days: number = 7) {
  return useQuery({
    queryKey: ['views-history', eventId, days],
    queryFn: async (): Promise<ViewsHistoryData> => {
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      const response = await fetch(`/api/views/${eventId}/history?days=${days}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get views history');
      }

      const result: ViewsHistoryResponse = await response.json();
      return result.data;
    },
    enabled: Boolean(eventId),
    staleTime: 5 * 60 * 1000, // 5 minutos - los datos se consideran frescos por 5 minutos
    refetchInterval: 5 * 60 * 1000, // Revalidar cada 5 minutos
    refetchOnWindowFocus: true, // Revalidar cuando la ventana recupera el foco
    refetchOnReconnect: true, // Revalidar cuando se reconecta a internet
  });
}
