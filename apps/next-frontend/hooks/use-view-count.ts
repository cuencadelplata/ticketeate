import { useEffect, useState } from 'react';

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

export function useViewCount(eventId: string | undefined) {
  const [isCounting, setIsCounting] = useState(false);
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Función para contar una nueva vista
  const countView = async (): Promise<ViewCountResult | null> => {
    if (!eventId || isCounting) return null;

    setIsCounting(true);
    setError(null);

    try {
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
      
      if (result.success && result.totalViews) {
        setViewCount(result.totalViews);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error counting view:', err);
      return null;
    } finally {
      setIsCounting(false);
    }
  };

  // Función para obtener el conteo actual
  const getViewCount = async (): Promise<ViewCountData | null> => {
    if (!eventId) return null;

    try {
      const response = await fetch(`/api/views/${eventId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get view count');
      }

      const data: ViewCountData = await response.json();
      setViewCount(data.views);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error getting view count:', err);
      return null;
    }
  };

  // Auto-contar vista cuando se monta el componente
  useEffect(() => {
    if (eventId) {
      countView();
    }
  }, [eventId]);

  return {
    countView,
    getViewCount,
    viewCount,
    isCounting,
    error,
  };
}
