'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, CreditCard, CheckCircle, Clock, TrendingUp, BarChart3 } from 'lucide-react';

interface RevenueStatsProps {
  revenue: {
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
  };
}

export function RevenueStats({ revenue }: RevenueStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmado: { label: 'Confirmado', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      pendiente: { label: 'Pendiente', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    const methodIcons = {
      tarjeta: CreditCard,
      efectivo: DollarSign,
      transferencia: TrendingUp,
    };
    return methodIcons[method as keyof typeof methodIcons] || DollarSign;
  };

  const totalRevenue = revenue.overview.totalRevenue;
  const confirmedPercentage = totalRevenue > 0 ? (revenue.overview.confirmedRevenue / totalRevenue) * 100 : 0;
  const pendingPercentage = totalRevenue > 0 ? (revenue.overview.pendingRevenue / totalRevenue) * 100 : 0;

  const overviewCards = [
    {
      title: 'Ingresos Totales',
      value: formatCurrency(revenue.overview.totalRevenue),
      icon: DollarSign,
      description: 'Todos los pagos',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Ingresos Confirmados',
      value: formatCurrency(revenue.overview.confirmedRevenue),
      icon: CheckCircle,
      description: `${formatCurrency(confirmedPercentage)}% del total`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Ingresos Pendientes',
      value: formatCurrency(revenue.overview.pendingRevenue),
      icon: Clock,
      description: `${formatCurrency(pendingPercentage)}% del total`,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        {overviewCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Distribución por estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribución por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenue.byStatus.map((statusData, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(statusData.estado)}
                      <span className="text-sm font-medium">
                        {statusData._count.id_pago} pagos
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(statusData._sum.monto_total)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {totalRevenue > 0 
                          ? Math.round((statusData._sum.monto_total / totalRevenue) * 100)
                          : 0}%
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={totalRevenue > 0 ? (statusData._sum.monto_total / totalRevenue) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribución por método de pago */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Distribución por Método
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenue.byMethod.map((methodData, index) => {
                const MethodIcon = getMethodIcon(methodData.metodo_pago);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MethodIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium capitalize">
                          {methodData.metodo_pago}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({methodData._count.id_pago} pagos)
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(methodData._sum.monto_total)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {totalRevenue > 0 
                            ? Math.round((methodData._sum.monto_total / totalRevenue) * 100)
                            : 0}%
                        </div>
                      </div>
                    </div>
                    <Progress 
                      value={totalRevenue > 0 ? (methodData._sum.monto_total / totalRevenue) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagos más altos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Pagos Más Altos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">Evento</th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">Método</th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">Estado</th>
                  <th className="text-left p-2 font-medium text-sm text-muted-foreground">Fecha</th>
                  <th className="text-right p-2 font-medium text-sm text-muted-foreground">Monto</th>
                </tr>
              </thead>
              <tbody>
                {revenue.topPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="font-medium">{payment.eventTitle}</div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const MethodIcon = getMethodIcon(payment.method);
                          return <MethodIcon className="h-4 w-4 text-muted-foreground" />;
                        })()}
                        <span className="capitalize">{payment.method}</span>
                      </div>
                    </td>
                    <td className="p-2">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="p-2 text-sm">
                      {formatDate(payment.date)}
                    </td>
                    <td className="p-2 text-right">
                      <div className="font-medium">{formatCurrency(payment.amount)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {revenue.topPayments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No hay pagos para mostrar
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
