'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
import { useSession } from '@/lib/auth-client';

export function useWalletStatus() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ['wallet-status'],
    queryFn: async () => {
      const token = session?.session?.token ?? '';
      const res = await fetch(API_ENDPOINTS.wallet, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al obtener estado de billetera');
      return res.json();
    },
    enabled: !!session?.session?.token,
  });
}

export function useLinkWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Redirigir al endpoint de OAuth de Mercado Pago
      window.location.href = '/api/mercadopago/auth';
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
      const res = await fetch(API_ENDPOINTS.walletUnlink, {
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
