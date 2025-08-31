'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Ticket, DollarSign, BarChart3 } from 'lucide-react';

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

interface EventsStatsTableProps {
  events: EventStats[];
}

export function EventsStatsTable({ events }: EventsStatsTableProps) {
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
      activo: {
        label: 'Activo',
        variant: 'default' as const,
        color: 'bg-green-100 text-green-800',
      },
      oculto: {
        label: 'Oculto',
        variant: 'secondary' as const,
        color: 'bg-gray-100 text-gray-800',
      },
      cancelado: {
        label: 'Cancelado',
        variant: 'destructive' as const,
        color: 'bg-red-100 text-red-800',
      },
      completado: {
        label: 'Completado',
        variant: 'outline' as const,
        color: 'bg-blue-100 text-blue-800',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.oculto;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    if (rate >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Estadísticas de Eventos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left text-sm font-medium text-muted-foreground">Evento</th>
                <th className="p-2 text-left text-sm font-medium text-muted-foreground">Estado</th>
                <th className="p-2 text-left text-sm font-medium text-muted-foreground">Fecha</th>
                <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                  Reservas
                </th>
                <th className="p-2 text-left text-sm font-medium text-muted-foreground">Stock</th>
                <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                  Ocupación
                </th>
                <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                  Precio Prom.
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">
                    <div className="font-medium">{event.titulo}</div>
                    <div className="text-xs text-muted-foreground">
                      {event.totalCategories} categorías
                    </div>
                  </td>
                  <td className="p-2">{getStatusBadge(event.estado)}</td>
                  <td className="p-2 text-sm">{formatDate(event.fecha_creacion)}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{event.totalReservations}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="text-sm">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Disponible: {event.availableStock}</span>
                        <span>Vendido: {event.soldStock}</span>
                      </div>
                      <div className="text-xs">Total: {event.totalStock}</div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="w-20">
                      <Progress value={event.occupancyRate} className="h-2" />
                      <div
                        className={`mt-1 text-xs font-medium ${getOccupancyColor(event.occupancyRate)}`}
                      >
                        {event.occupancyRate}%
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="font-medium">{formatCurrency(event.avgPrice)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {events.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">No hay eventos para mostrar</div>
        )}
      </CardContent>
    </Card>
  );
}
