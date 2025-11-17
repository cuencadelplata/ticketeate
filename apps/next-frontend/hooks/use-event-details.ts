'use client';

import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';

export interface EventCategory {
  id: string;
  name: string;
  price: number;
  stock: number;
  available: number;
}

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  location: string;
  organizerId: string;
  organizerName: string;
  categories: EventCategory[];
  image?: string;
  date?: string;
}

/**
 * Hook para obtener los detalles de un evento incluyendo categorías de entradas
 */
export function useEventDetails(eventId: string) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await fetch(`${API_ENDPOINTS.publicEventById(eventId)}`);
      if (!res.ok) {
        throw new Error('Error al obtener evento');
      }
      return res.json() as Promise<EventDetails>;
    },
    enabled: !!eventId,
  });
}

/**
 * Hook para obtener las categorías/stock de entradas de un evento
 */
export function useEventCategories(eventId: string) {
  return useQuery({
    queryKey: ['event-categories', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/checkout/categories?eventId=${eventId}`, {
        method: 'GET',
      });
      if (!res.ok) {
        throw new Error('Error al obtener categorías');
      }
      const data = await res.json();
      return data.categories as EventCategory[];
    },
    enabled: !!eventId,
  });
}
