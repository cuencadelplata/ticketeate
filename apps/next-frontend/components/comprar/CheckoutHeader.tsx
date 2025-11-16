'use client';

import { useCheckout } from '@/contexts/CheckoutContext';

export function CheckoutHeader() {
  const { resetForm, cancelPurchase } = useCheckout();

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
      <span className="font-bold">Seleccionar sector</span>
      <div className="flex items-center gap-2">
        <button
          className="rounded-md px-3 py-1 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          onClick={cancelPurchase}
        >
          Cancelar
        </button>
        <button className="font-semibold text-orange-500 hover:underline" onClick={resetForm}>
          Limpiar selección
        </button>
      </div>
    </div>
  );
}
