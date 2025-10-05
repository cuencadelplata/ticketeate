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
  });
}
