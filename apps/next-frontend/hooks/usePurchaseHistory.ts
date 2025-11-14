'use client';

import { useQuery } from '@tanstack/react-query';
import { Purchase, PurchaseFilters } from '@/types/purchase';
import { purchaseApi } from '@/lib/purchase-api';
import { PURCHASE_CONFIG } from '@/lib/scanner-config';

export function usePurchaseHistory(page: number = 1, filters?: PurchaseFilters) {
  return useQuery({
    queryKey: ['purchases', page, filters],
    queryFn: () => purchaseApi.fetchPurchases(page, filters),
    staleTime: PURCHASE_CONFIG.STALE_TIME,
    gcTime: PURCHASE_CONFIG.CACHE_TIME,
    retry: 2,
  });
}

export function usePurchaseById(id: string) {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchaseApi.fetchPurchaseById(id),
    staleTime: PURCHASE_CONFIG.STALE_TIME,
    gcTime: PURCHASE_CONFIG.CACHE_TIME,
    enabled: !!id,
  });
}

export function usePurchaseTicketDownload(id: string) {
  return useQuery({
    queryKey: ['purchaseTicket', id],
    queryFn: () => purchaseApi.downloadPurchaseTicket(id),
    enabled: false,
    staleTime: Infinity,
  });
}
