'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePurchases } from '@/hooks/use-purchases';
import { Ticket, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface PurchaseSummaryProps {
  showFullStats?: boolean;
}

export default function PurchaseSummary({ showFullStats = false }: PurchaseSummaryProps) {
  const { purchases, stats, loading } = usePurchases(true);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Mis Compras Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const recentPurchases = purchases.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Estadísticas rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumen de Compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold">{stats?.totalPurchases || 0}</p>
              <p className="text-sm text-muted-foreground">Compras Totales</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(stats?.totalSpent || 0)}</p>
              <p className="text-sm text-muted-foreground">Total Gastado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compras recientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Compras Recientes
          </CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/mis-compras" className="flex items-center gap-1">
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentPurchases.length === 0 ? (
            <div className="py-6 text-center">
              <Ticket className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No tienes compras aún</p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href="/descubrir">Explorar Eventos</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPurchases.map(purchase => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{purchase.event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(purchase.purchaseDate)} • {purchase.quantity} entrada
                      {purchase.quantity > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(purchase.totalAmount)}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {purchase.status.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}

              {showFullStats && stats && (
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Compras completadas:</span>
                    <span className="font-medium">{stats.completedPurchases}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
