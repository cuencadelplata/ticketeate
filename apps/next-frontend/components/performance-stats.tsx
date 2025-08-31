'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, BarChart3, DollarSign, Users, Trophy } from 'lucide-react';

interface PerformanceStatsProps {
  performance: {
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
  };
}

export function PerformanceStats({ performance }: PerformanceStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPerformanceColor = (value: number, type: 'rate' | 'metric') => {
    if (type === 'rate') {
      if (value >= 80) return 'text-green-600';
      if (value >= 60) return 'text-yellow-600';
      if (value >= 40) return 'text-orange-600';
      return 'text-red-600';
    } else {
      if (value > 0) return 'text-green-600';
      return 'text-gray-600';
    }
  };

  const metricsCards = [
    {
      title: 'Reservas por Evento',
      value: performance.metrics.avgReservationsPerEvent.toFixed(1),
      icon: Users,
      description: 'Promedio de reservas',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      unit: 'reservas',
    },
    {
      title: 'Ingresos por Evento',
      value: formatCurrency(performance.metrics.avgRevenuePerEvent),
      icon: DollarSign,
      description: 'Promedio de ingresos',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      unit: '',
    },
    {
      title: 'Tasa de Conversión',
      value: `${performance.metrics.conversionRate.toFixed(1)}%`,
      icon: Target,
      description: 'Reservas confirmadas',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      unit: '',
    },
    {
      title: 'Precio Promedio',
      value: formatCurrency(performance.metrics.avgTicketPrice),
      icon: BarChart3,
      description: 'Por entrada',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      unit: '',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricsCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Eventos con mejor rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Eventos con Mejor Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">Posición</th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">Evento</th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">Reservas</th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">Entradas Vendidas</th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">Ingresos</th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">Rendimiento</th>
                </tr>
              </thead>
              <tbody>
                {performance.topPerformingEvents.map((event, index) => {
                  const position = index + 1;
                  const getPositionBadge = (pos: number) => {
                    if (pos === 1) return <Badge className="bg-yellow-100 text-yellow-800">🥇 1ro</Badge>;
                    if (pos === 2) return <Badge className="bg-gray-100 text-gray-800">🥈 2do</Badge>;
                    if (pos === 3) return <Badge className="bg-orange-100 text-orange-800">🥉 3ro</Badge>;
                    return <Badge variant="outline">{pos}°</Badge>;
                  };

                  const getPerformanceScore = () => {
                    const score = (event.totalReservations * 0.4) + (event.totalSold * 0.3) + (event.totalRevenue / 100 * 0.3);
                    if (score >= 80) return { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-50' };
                    if (score >= 60) return { label: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-50' };
                    if (score >= 40) return { label: 'Regular', color: 'text-yellow-600', bg: 'bg-yellow-50' };
                    return { label: 'Bajo', color: 'text-red-600', bg: 'bg-red-50' };
                  };

                  const performance = getPerformanceScore();

                  return (
                    <tr key={event.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        {getPositionBadge(position)}
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{event.title}</div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{event.totalReservations}</span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{event.totalSold}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{formatCurrency(event.totalRevenue)}</div>
                      </td>
                      <td className="p-2">
                        <Badge className={`${performance.bg} ${performance.color}`}>
                          {performance.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {performance.topPerformingEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay eventos para mostrar
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de rendimiento */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Análisis de Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tasa de conversión</span>
                <span className={`font-medium ${getPerformanceColor(performance.metrics.conversionRate, 'rate')}`}>
                  {performance.metrics.conversionRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Eficiencia de ventas</span>
                <span className={`font-medium ${getPerformanceColor(performance.metrics.avgReservationsPerEvent, 'metric')}`}>
                  {performance.metrics.avgReservationsPerEvent.toFixed(1)} reservas/evento
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Valor promedio</span>
                <span className={`font-medium ${getPerformanceColor(performance.metrics.avgTicketPrice, 'metric')}`}>
                  {formatCurrency(performance.metrics.avgTicketPrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Recomendaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {performance.metrics.conversionRate < 60 && (
                <div className="p-2 bg-yellow-50 rounded-md">
                  <span className="text-yellow-800">
                    ⚠️ La tasa de conversión es baja. Considera revisar el proceso de confirmación.
                  </span>
                </div>
              )}
              {performance.metrics.avgReservationsPerEvent < 5 && (
                <div className="p-2 bg-blue-50 rounded-md">
                  <span className="text-blue-800">
                    💡 El promedio de reservas por evento es bajo. Revisa la estrategia de marketing.
                  </span>
                </div>
              )}
              {performance.metrics.avgTicketPrice < 50 && (
                <div className="p-2 bg-green-50 rounded-md">
                  <span className="text-green-800">
                    ✅ Los precios están en un rango competitivo.
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
