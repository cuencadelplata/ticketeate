'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
import { useSession } from '@/lib/auth-client';
import { fetchWithApiKey } from '@/lib/fetch-api';

export function useWalletStatus() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['wallet-status'],
    queryFn: async () => {
      const token = session?.session?.token ?? '';
      const res = await fetchWithApiKey(API_ENDPOINTS.wallet, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al obtener estado de billetera');
      return res.json();
    },
    enabled: !!session?.session?.token,
  });
}

export function useLinkWallet() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: string = 'mercado_pago') => {
      if (provider === 'mock') {
        // Para simulación, hacer llamada directa a la API
        const token = session?.session?.token ?? '';
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
      const token = session?.session?.token ?? '';
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
      const token = session?.session?.token ?? '';
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
