'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePurchases } from '@/hooks/use-purchases';
import { CalendarDays, MapPin, Ticket, CreditCard, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface PurchaseHistoryProps {
  showStats?: boolean;
}

export default function PurchaseHistory({ showStats = true }: PurchaseHistoryProps) {
  const { purchases, stats, loading, error, refetch } = usePurchases(showStats);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      COMPLETED: { label: 'Completado', variant: 'default' as const },
      PENDING: { label: 'Pendiente', variant: 'secondary' as const },
      CANCELLED: { label: 'Cancelado', variant: 'destructive' as const },
      REFUNDED: { label: 'Reembolsado', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'secondary' as const,
    };

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-24 w-24 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" className="ml-2" onClick={refetch}>
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {showStats && stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Compras</p>
                  <p className="text-2xl font-bold">{stats.totalPurchases}</p>
                </div>
                <Ticket className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Gastado</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compras Completadas</p>
                  <p className="text-2xl font-bold">{stats.completedPurchases}</p>
                </div>
                <Ticket className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de compras */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Historial de Compras</h2>
          <Button variant="outline" size="sm" onClick={refetch}>
            Actualizar
          </Button>
        </div>

        {purchases.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Ticket className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No tienes compras aún</h3>
              <p className="text-muted-foreground">
                Cuando compres entradas para eventos, aparecerán aquí.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {purchases.map(purchase => (
              <Card key={purchase.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-6">
                    {/* Imagen del evento */}
                    <div className="relative h-24 w-24 flex-shrink-0">
                      {purchase.event.imageUrl ? (
                        <Image
                          src={purchase.event.imageUrl}
                          alt={purchase.event.name}
                          fill
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-muted">
                          <Ticket className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Información de la compra */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="truncate text-lg font-semibold">{purchase.event.name}</h3>
                          {purchase.ticketOption && (
                            <p className="text-sm text-muted-foreground">
                              {purchase.ticketOption.name}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(purchase.status)}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>{formatDate(purchase.purchaseDate)}</span>
                        </div>

                        {purchase.event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{purchase.event.location}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-4">
                            <span>
                              Cantidad: <strong>{purchase.quantity}</strong>
                            </span>
                            {purchase.paymentMethod && (
                              <span>
                                Método: <strong>{purchase.paymentMethod}</strong>
                              </span>
                            )}
                          </div>
                          <span className="text-lg font-semibold text-foreground">
                            {formatCurrency(purchase.totalAmount)}
                          </span>
                        </div>

                        {/* Tickets generados */}
                        {purchase.tickets.length > 0 && (
                          <div className="border-t pt-2">
                            <p className="text-xs text-muted-foreground">
                              Tickets: {purchase.tickets.map(t => t.id.slice(-8)).join(', ')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
