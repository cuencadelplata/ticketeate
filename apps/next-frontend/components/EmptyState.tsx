'use client';

import { Package } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No hay compras disponibles
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Parece que aún no has realizado ninguna compra. ¡Comienza ahora!
        </p>
      </div>
    </div>
  );
}
