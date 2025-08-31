'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Ticket,
  DollarSign,
  BarChart3,
} from 'lucide-react';

interface OverviewStatsProps {
  overview: {
    totalEvents: number;
    totalUsers: number;
    totalReservations: number;
    totalRevenue: number;
    activeEvents: number;
    completedEvents: number;
    pendingReservations: number;
    confirmedReservations: number;
  };
  last30Days: {
    newEvents: number;
    newReservations: number;
    revenue: number;
  };
}

export function StatsOverview({ overview, last30Days }: OverviewStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Total Eventos',
      value: overview.totalEvents,
      icon: Calendar,
      description: `${last30Days.newEvents} nuevos este mes`,
      trend: last30Days.newEvents > 0 ? 'up' : 'down',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Usuarios',
      value: overview.totalUsers,
      icon: Users,
      description: 'Usuarios registrados',
      trend: 'neutral',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Reservas',
      value: overview.totalReservations,
      icon: Ticket,
      description: `${overview.pendingReservations} pendientes`,
      trend: overview.confirmedReservations > overview.pendingReservations ? 'up' : 'down',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(overview.totalRevenue),
      icon: DollarSign,
      description: `${formatCurrency(last30Days.revenue)} este mes`,
      trend: last30Days.revenue > 0 ? 'up' : 'down',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Eventos Activos',
      value: overview.activeEvents,
      icon: BarChart3,
      description: `${overview.completedEvents} completados`,
      trend: overview.activeEvents > 0 ? 'up' : 'down',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Tasa de Confirmación',
      value: `${Math.round((overview.confirmedReservations / Math.max(overview.totalReservations, 1)) * 100)}%`,
      icon: TrendingUp,
      description: 'Reservas confirmadas',
      trend: overview.confirmedReservations > overview.pendingReservations ? 'up' : 'down',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
              {stat.trend !== 'neutral' && (
                <div className="mt-2 flex items-center">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {stat.trend === 'up' ? 'Creciendo' : 'Decreciendo'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
