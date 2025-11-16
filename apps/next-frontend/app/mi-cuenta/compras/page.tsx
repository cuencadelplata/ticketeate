'use client';

import { useSession } from '@/lib/auth-client';
import { Navbar } from '@/components/navbar';
import { ShoppingCart, Calendar, MapPin, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Purchase {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketQuantity: number;
  totalPrice: number;
  purchaseDate: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export default function ComprasPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;

    if (!session?.user) {
      window.location.href = '/';
      return;
    }

    // TODO: Cargar las compras del usuario desde la API
    setIsLoading(false);
  }, [session, sessionLoading]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-stone-500/20 text-stone-400 border-stone-500/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (sessionLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pb-4">
          <Navbar />
        </div>
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pb-4">
        <Navbar />
      </div>

      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="w-8 h-8 text-blue-500" />
              <h1 className="text-4xl font-instrument-serif font-light bg-gradient-to-r from-white to-stone-300 bg-clip-text text-transparent">
                Mis Compras
              </h1>
            </div>
            <p className="text-stone-400">Historial de todas tus compras de entradas</p>
          </div>

          {/* Contenido */}
          {purchases.length === 0 ? (
            <div className="rounded-lg border border-stone-700 bg-stone-900/50 p-12 text-center">
              <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-stone-500" />
              <h3 className="mb-2 text-lg font-medium text-stone-300">No tienes compras</h3>
              <p className="text-stone-400 mb-6">Aún no has realizado ninguna compra de entradas</p>
              <a
                href="/"
                className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
              >
                Explorar eventos
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="rounded-lg border border-stone-700 bg-stone-900/30 p-6 hover:bg-stone-900/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-white mb-2">{purchase.eventTitle}</h3>
                      <div className="space-y-1 text-sm text-stone-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(purchase.eventDate).toLocaleDateString('es-AR')}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {purchase.eventLocation}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400 mb-2">
                        ${purchase.totalPrice}
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          purchase.status,
                        )}`}
                      >
                        {getStatusLabel(purchase.status)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stone-400 pt-4 border-t border-stone-700">
                    <Ticket className="w-4 h-4" />
                    <span>
                      {purchase.ticketQuantity} entrada{purchase.ticketQuantity !== 1 ? 's' : ''}
                    </span>
                    <span className="ml-auto">
                      Compra: {new Date(purchase.purchaseDate).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
