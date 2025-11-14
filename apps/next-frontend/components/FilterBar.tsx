'use client';

import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { PurchaseFilters } from '@/types/purchase';

interface FilterBarProps {
  filters: PurchaseFilters;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: any) => void;
  onSortChange: (sort: 'date' | 'price' | 'name') => void;
  onReset: () => void;
}

export function FilterBar({
  filters,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onReset,
}: FilterBarProps) {
  return (
    <div className="space-y-3 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar evento, nombre..."
          value={filters.search || ''}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <select
          value={filters.status || ''}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
        >
          <option value="">Todos los estados</option>
          <option value="completed">Completada</option>
          <option value="pending">Pendiente</option>
          <option value="cancelled">Cancelada</option>
          <option value="refunded">Reembolsada</option>
        </select>

        <select
          value={filters.sortBy || 'date'}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-gray-900 dark:text-white"
        >
          <option value="date">Fecha</option>
          <option value="price">Precio</option>
          <option value="name">Nombre</option>
        </select>

        <button
          onClick={onReset}
          className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
