'use client';

import { useCallback, useState } from 'react';
import { PurchaseFilters } from '@/types/purchase';

export function usePurchaseFilters(initialFilters?: PurchaseFilters) {
  const [filters, setFilters] = useState<PurchaseFilters>(initialFilters || {});

  const updateFilter = useCallback((key: keyof PurchaseFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const setSearch = useCallback(
    (search: string) => {
      updateFilter('search', search || undefined);
    },
    [updateFilter],
  );

  const setStatus = useCallback(
    (status: any) => {
      updateFilter('status', status || undefined);
    },
    [updateFilter],
  );

  const setSortBy = useCallback(
    (sortBy: 'date' | 'price' | 'name') => {
      updateFilter('sortBy', sortBy);
    },
    [updateFilter],
  );

  const setSortOrder = useCallback(
    (sortOrder: 'asc' | 'desc') => {
      updateFilter('sortOrder', sortOrder);
    },
    [updateFilter],
  );

  const setDateRange = useCallback((startDate?: string, endDate?: string) => {
    setFilters((prev) => ({
      ...prev,
      startDate,
      endDate,
    }));
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
    setSearch,
    setStatus,
    setSortBy,
    setSortOrder,
    setDateRange,
  };
}
