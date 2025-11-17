'use client';

import { CheckoutSection } from '@/components/checkout-section';
import type { Event } from '@/types/events';
import { Card } from '@/components/ui/card';

interface EventCheckoutWrapperProps {
  event: Event;
}

export function EventCheckoutWrapper({ event }: EventCheckoutWrapperProps) {
  // Verificar si el evento tiene categorías de entradas
  if (!event.stock_entrada || event.stock_entrada.length === 0) {
    return null;
  }

  // Convertir stock_entrada a format de categorías
  const categories = event.stock_entrada.map((stock) => ({
    id: stock.stockid,
    name: stock.nombre,
    price: Number(stock.precio) / 100, // Convertir de centavos a pesos
    stock: stock.cant_max,
    available: stock.cant_max, // En prod, restar vendidas
  }));

  // Obtener datos del organizador
  const organizerName = 'Organizador'; // event.user?.name is not available in Event type
  const organizerId = event.creadorid;

  return (
    <Card className="bg-stone-800/40 border-stone-700 p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-stone-100 mb-1">Comprar Entradas</h2>
        <p className="text-stone-400">Selecciona tus entradas y realiza el pago</p>
      </div>

      <CheckoutSection
        eventId={event.eventoid}
        eventTitle={event.titulo}
        categories={categories}
        organizerId={organizerId}
        organizerName={organizerName}
      />
    </Card>
  );
}
