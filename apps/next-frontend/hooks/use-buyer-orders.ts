'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';

/**
 * Hook para obtener las órdenes/compras del usuario autenticado
 */
export function useBuyerOrders(status: string = 'all', limit: number = 50, offset: number = 0) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['buyer-orders', status, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        status,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`/api/checkout/orders?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener órdenes');
      }

      return response.json();
    },
    enabled: !!session?.user?.id,
  });
}

/**
 * Hook para obtener las entradas compradas del usuario
 */
export function useBuyerTickets(
  eventId?: string,
  status: string = 'all',
  limit: number = 50,
  offset: number = 0,
) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['buyer-tickets', eventId, status, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(eventId && { eventId }),
        status,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`/api/checkout/tickets?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener entradas');
      }

      return response.json();
    },
    enabled: !!session?.user?.id,
  });
}

/**
 * Hook para obtener las ventas del organizador (ordenador autenticado)
 */
export function useOrganizerSales(
  eventId?: string,
  status: string = 'approved',
  limit: number = 50,
  offset: number = 0,
) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['organizer-sales', eventId, status, limit, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(eventId && { eventId }),
        status,
        limit: limit.toString(),
        offset: offset.toString(),
      });

      const response = await fetch(`/api/checkout/sales?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener ventas');
      }

      return response.json();
    },
    enabled: !!session?.user?.id,
  });
}

/**
 * Hook para obtener categorías de un evento (público, sin auth)
 */
export function useEventCategoriesPublic(eventId: string) {
  return useQuery({
    queryKey: ['event-categories-public', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/checkout/categories?eventId=${eventId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }

      return response.json();
    },
    enabled: !!eventId,
  });
}

/**
 * Hook para obtener stock de un evento (público, sin auth)
 */
export function useEventStockPublic(eventId: string) {
  return useQuery({
    queryKey: ['event-stock-public', eventId],
    queryFn: async () => {
      const response = await fetch(`/api/checkout/stock?eventId=${eventId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al obtener stock');
      }

      return response.json();
    },
    enabled: !!eventId,
  });
}
