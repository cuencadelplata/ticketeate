import { useState, useEffect } from 'react';

interface ViewStats {
  pendingSync: number;
  totalPendingViews: number;
  events: Array<{
    eventId: string;
    pendingViews: number;
  }>;
}

interface SyncResult {
  message: string;
  synced: number;
  processed: number;
  results: Array<{
    eventId: string;
    count: number;
    synced: boolean;
    error?: string;
  }>;
}

export function useViewMetrics() {
  const [stats, setStats] = useState<ViewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/views', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch view stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching view stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const syncViews = async (): Promise<SyncResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/views', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync views');
      }

      const result: SyncResult = await response.json();

      // Refrescar las estadísticas después de la sincronización
      await fetchStats();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error syncing views:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    syncViews,
  };
}
