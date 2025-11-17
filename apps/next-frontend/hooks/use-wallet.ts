'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
import { useSession } from '@/lib/auth-client';
import { fetchWithApiKey } from '@/lib/fetch-api';

// Helper para obtener token JWT dinámicamente
async function getAuthToken(): Promise<string> {
  try {
    console.log('[getAuthToken] Fetching token from /api/auth/token');
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include',
    });
    console.log('[getAuthToken] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Token endpoint error: ${response.status} - ${errorData.error || response.statusText}`,
      );
    }
    const data = await response.json();
    console.log('[getAuthToken] Token received, length:', data.token?.length || 0);

    if (!data.token) {
      throw new Error('No token in response');
    }
    return data.token;
  } catch (error) {
    console.error('[getAuthToken] Error:', error);
    throw error;
  }
}

export function useWalletStatus() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['wallet-status'],
    queryFn: async () => {
      try {
        console.log('[useWalletStatus] Starting query');
        const token = await getAuthToken();
        console.log('[useWalletStatus] Token obtained, length:', token.length);
        console.log('[useWalletStatus] Calling wallet API with token');

        const res = await fetchWithApiKey(API_ENDPOINTS.wallet, {
          headers: { Authorization: `Bearer ${token}` },
          method: 'GET',
        });

        console.log('[useWalletStatus] Wallet API response status:', res.status);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
          throw new Error(errorData.error || 'Error al obtener estado de billetera');
        }
        return res.json();
      } catch (error) {
        console.error('Error en useWalletStatus:', error);
        throw error;
      }
    },
    enabled: !!session?.user?.id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useLinkWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: string = 'mercado_pago') => {
      if (provider === 'mock') {
        // Para simulación, hacer llamada directa a la API
        const token = await getAuthToken();
        const res = await fetchWithApiKey(API_ENDPOINTS.walletLink, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ provider: 'mock' }),
        });
        if (!res.ok) throw new Error('Error al vincular billetera simulada');
        return res.json();
      } else {
        // Para Mercado Pago real, redirigir al endpoint de OAuth
        window.location.href = '/api/mercadopago/auth';
      }
    },
    onSuccess: () => {
      // Invalidar la query para refrescar el estado
      queryClient.invalidateQueries({ queryKey: ['wallet-status'] });
    },
  });
}

export function useUnlinkWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getAuthToken();
      const res = await fetchWithApiKey(API_ENDPOINTS.walletUnlink, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Error al desvincular billetera');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-status'] });
    },
  });
}

export function useSimulatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentData: { amount: number; eventId: string; ticketCount: number }) => {
      const token = await getAuthToken();
      const res = await fetchWithApiKey(`${API_ENDPOINTS.wallet}/simulate-payment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      if (!res.ok) throw new Error('Error al simular pago');
      return res.json();
    },
    onSuccess: () => {
      // Invalidar queries relacionadas con pagos si las hay
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

/**
 * Hook para crear una preferencia de pago con Marketplace (10% fee)
 * El organizador debe tener su cuenta de MercadoPago vinculada
 */
export function useCreateMarketplacePreference() {
  return useMutation({
    mutationFn: async (data: {
      items: Array<{
        title: string;
        quantity: number;
        unit_price: number;
        currency_id?: string;
      }>;
      external_reference: string;
      metadata?: Record<string, any>;
    }) => {
      console.log('[useCreateMarketplacePreference] Creating preference:', {
        itemsCount: data.items.length,
        external_reference: data.external_reference,
      });

      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[useCreateMarketplacePreference] Error:', {
          status: response.status,
          error: errorData,
        });
        throw new Error(errorData.error || 'Error al crear preferencia de pago');
      }

      const result = await response.json();

      console.log('[useCreateMarketplacePreference] Success:', {
        preferenceId: result.id,
        marketplaceFee: result.marketplace_fee,
        total: result.total,
      });

      return result;
    },
  });
}

/**
 * Hook para obtener las órdenes de marketplace del organizador
 */
export function useMarketplaceOrders() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['marketplace-orders'],
    queryFn: async () => {
      const response = await fetch('/api/checkout/orders', {
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
