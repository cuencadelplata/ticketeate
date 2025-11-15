'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
import { useSession } from '@/lib/auth-client';
import { fetchWithApiKey } from '@/lib/fetch-api';

// Helper para obtener token JWT dinámicamente
async function getAuthToken(): Promise<string> {
  try {
    const response = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Token endpoint error: ${response.status} - ${errorData.error || response.statusText}`,
      );
    }
    const data = await response.json();
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
        const token = await getAuthToken();
        const res = await fetchWithApiKey(API_ENDPOINTS.wallet, {
          headers: { Authorization: `Bearer ${token}` },
          method: 'GET',
        });
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
  const { data: session } = useSession();
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
  const { data: session } = useSession();
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
  const { data: session } = useSession();
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
