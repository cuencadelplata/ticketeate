'use client';

import React from 'react';
import type { Event } from '@/types/events';

type EventHeaderProps = {
  event: Event;
  onBack: () => void;
};

export function EventHeader({ event, onBack }: EventHeaderProps) {
  return (
    <div className="text-center bg-white rounded-xl p-6 shadow-lg">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:text-blue-500 text-sm underline">
        ← Volver a seleccionar evento
      </button>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.titulo}</h1>
      <p className="text-xl text-gray-600 mb-1">
        {event.fechas_evento?.[0]?.fecha_hora
          ? new Date(event.fechas_evento[0].fecha_hora).toLocaleDateString('es-AR') +
            ' · ' +
            new Date(event.fechas_evento[0].fecha_hora).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : new Date(event.fecha_inicio_venta).toLocaleDateString('es-AR')}
      </p>
      <p className="text-gray-500 text-sm">Selecciona tu sector y completa tu compra</p>
    </div>
  );
}
