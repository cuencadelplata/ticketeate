'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
import { useAuth } from '@clerk/nextjs';

export function useWalletStatus() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ['wallet-status'],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(API_ENDPOINTS.wallet, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      if (!res.ok) throw new Error('Error al obtener estado de billetera');
      return res.json() as Promise<{ wallet_linked: boolean; wallet_provider: string | null }>;
    },
    staleTime: 60 * 1000,
  });
}

export function useLinkWallet() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (provider: string = 'mercado_pago') => {
      const token = await getToken();
      const res = await fetch(API_ENDPOINTS.walletLink, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ provider }),
      });
      if (!res.ok) throw new Error('Error al vincular billetera');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallet-status'] }),
  });
}

export function useUnlinkWallet() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(API_ENDPOINTS.walletUnlink, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      if (!res.ok) throw new Error('Error al desvincular billetera');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wallet-status'] }),
  });
}


