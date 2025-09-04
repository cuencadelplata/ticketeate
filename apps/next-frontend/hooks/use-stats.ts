import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface OverviewStats {
  totalEvents: number;
  totalUsers: number;
  totalReservations: number;
  totalRevenue: number;
  activeEvents: number;
  completedEvents: number;
  pendingReservations: number;
  confirmedReservations: number;
}

interface Last30Days {
  newEvents: number;
  newReservations: number;
  revenue: number;
}

interface EventStats {
  id: string;
  titulo: string;
  estado: string;
  fecha_creacion: string;
  totalReservations: number;
  totalCategories: number;
  totalStock: number;
  availableStock: number;
  soldStock: number;
  avgPrice: number;
  occupancyRate: number;
}

interface UserStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    recentRegistrations: number;
  };
  usersByRole: Array<{
    rol: string;
    _count: { rol: number };
  }>;
  topUsers: Array<{
    id: string;
    name: string;
    email: string;
    totalReservations: number;
  }>;
}

interface RevenueStats {
  overview: {
    totalRevenue: number;
    confirmedRevenue: number;
    pendingRevenue: number;
  };
  byStatus: Array<{
    estado: string;
    _sum: { monto_total: number };
    _count: { id_pago: number };
  }>;
  byMethod: Array<{
    metodo_pago: string;
    _sum: { monto_total: number };
    _count: { id_pago: number };
  }>;
  topPayments: Array<{
    id: string;
    amount: number;
    method: string;
    status: string;
    eventTitle: string;
    date: string;
  }>;
}

interface PerformanceStats {
  metrics: {
    avgReservationsPerEvent: number;
    avgRevenuePerEvent: number;
    conversionRate: number;
    avgTicketPrice: number;
  };
  topPerformingEvents: Array<{
    id: string;
    title: string;
    totalReservations: number;
    totalSold: number;
    totalRevenue: number;
  }>;
}

interface StatsData {
  overview: OverviewStats;
  last30Days: Last30Days;
}

export function useStats() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewStats, setOverviewStats] = useState<StatsData | null>(null);
  const [eventsStats, setEventsStats] = useState<EventStats[]>([]);
  const [usersStats, setUsersStats] = useState<UserStats | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);

  const fetchStats = async (endpoint: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/stats/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${endpoint} stats:`, err);
      throw err;
    }
  };

  const loadOverviewStats = async () => {
    try {
      const data = await fetchStats('overview');
      setOverviewStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas generales');
    }
  };

  const loadEventsStats = async () => {
    try {
      const data = await fetchStats('events');
      setEventsStats(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas de eventos');
    }
  };

  const loadUsersStats = async () => {
    try {
      const data = await fetchStats('users');
      setUsersStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas de usuarios');
    }
  };

  const loadRevenueStats = async () => {
    try {
      const data = await fetchStats('revenue');
      setRevenueStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas de ingresos');
    }
  };

  const loadPerformanceStats = async () => {
    try {
      const data = await fetchStats('performance');
      setPerformanceStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas de rendimiento');
    }
  };

  const loadAllStats = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadOverviewStats(),
        loadEventsStats(),
        loadUsersStats(),
        loadRevenueStats(),
        loadPerformanceStats(),
      ]);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error al cargar todas las estadísticas:', err);
        setError(err.message);
      } else {
        setError('Error al cargar todas las estadísticas');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    loadAllStats();
  };

  useEffect(() => {
    loadAllStats();
  }, []);

  return {
    loading,
    error,
    overviewStats,
    eventsStats,
    usersStats,
    revenueStats,
    performanceStats,
    refreshStats,
    loadOverviewStats,
    loadEventsStats,
    loadUsersStats,
    loadRevenueStats,
    loadPerformanceStats,
  };
}
