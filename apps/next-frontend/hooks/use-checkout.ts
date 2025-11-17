'use client';

import { useMutation } from '@tanstack/react-query';

export interface CheckoutValidationResponse {
  valid: boolean;
  eventId: string;
  buyer?: {
    id: string;
    email: string;
  };
  organizer?: {
    id: string;
    name: string;
    email: string;
    wallet_linked: boolean;
    wallet_provider: string;
    mercado_pago_user_id: string;
  };
  event?: {
    id: string;
    title: string;
  };
  error?: string;
  code?: string;
}

/**
 * Hook para validar que un checkout es posible
 * Verifica:
 * - Usuario autenticado
 * - Organizador tiene wallet vinculada
 * - Token de wallet no ha expirado
 * - Hay stock disponible
 */
export function useCheckoutValidation() {
  return useMutation({
    mutationFn: async (eventId: string): Promise<CheckoutValidationResponse> => {
      const response = await fetch('/api/checkout/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al validar checkout');
      }

      return data;
    },
  });
}

/**
 * Hook para obtener las categorías de entradas de un evento
 */
export function useCheckoutCategories(eventId: string) {
  return useMutation({
    mutationFn: async (): Promise<any> => {
      const response = await fetch(`/api/checkout/categories?eventId=${eventId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }

      return response.json();
    },
  });
}

/**
 * Hook para obtener el stock de entradas
 */
export function useCheckoutStock(eventId: string) {
  return useMutation({
    mutationFn: async (): Promise<any> => {
      const response = await fetch(`/api/checkout/stock?eventId=${eventId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al obtener stock');
      }

      return response.json();
    },
  });
}
