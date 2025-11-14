'use client';

import { useState } from 'react';
import { Purchase, PurchaseFilters } from '@/types/purchase';
import { usePurchaseHistory, usePurchaseFilters } from '@/hooks';
import { FilterBar } from './FilterBar';
import { PurchaseGrid } from './PurchaseGrid';
import { PurchaseDetailModal } from './PurchaseDetailModal';
import { EmptyState } from './EmptyState';
import { AlertCircle, Loader } from 'lucide-react';

export function PurchaseHistoryPage() {
  const [page, setPage] = useState(1);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const { filters, setSearch, setStatus, setSortBy, resetFilters } = usePurchaseFilters();
  const { data, isLoading, isError, error } = usePurchaseHistory(page, filters);

  const handleDownload = async (purchase: Purchase) => {
    // Implement download logic
    console.log('Download purchase:', purchase.id);
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-200">
                Error al cargar el historial
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {error instanceof Error ? error.message : 'Intenta nuevamente'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const purchases = data?.data || [];
  const isEmpty = !isLoading && purchases.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Historial de Compras
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Consulta y descarga tus tickets aquí</p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterBar
            filters={filters}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onSortChange={setSortBy}
            onReset={resetFilters}
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        )}

        {/* Empty State */}
        {isEmpty && <EmptyState />}

        {/* Purchase Grid */}
        {!isLoading && !isEmpty && (
          <>
            <PurchaseGrid
              purchases={purchases}
              onCardClick={setSelectedPurchase}
              onDownload={handleDownload}
            />

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Página {page} de {data.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <PurchaseDetailModal
        purchase={selectedPurchase || undefined}
        isOpen={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        onDownload={() => handleDownload(selectedPurchase!)}
      />
    </div>
  );
}
