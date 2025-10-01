import { useState, useEffect } from 'react';
import { PurchaseHistoryItem } from '@/lib/purchases';

interface PurchaseStats {
  totalPurchases: number;
  totalSpent: number;
  completedPurchases: number;
}

interface UsePurchasesReturn {
  purchases: PurchaseHistoryItem[];
  stats: PurchaseStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePurchases(includeStats = false): UsePurchasesReturn {
  const [purchases, setPurchases] = useState<PurchaseHistoryItem[]>([]);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/purchases/history${includeStats ? '?includeStats=true' : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error al obtener el historial de compras');
      }

      const result = await response.json();

      if (result.success) {
        setPurchases(result.data.purchases);
        if (includeStats) {
          setStats(result.data.stats);
        }
      } else {
        throw new Error(result.error || 'Error al obtener el historial');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [includeStats]);

  return {
    purchases,
    stats,
    loading,
    error,
    refetch: fetchPurchases,
  };
}
