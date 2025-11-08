'use client';

import React from 'react';

type StripeSuccessMessageProps = {
  onContinue: () => void;
};

export function StripeSuccessMessage({ onContinue }: StripeSuccessMessageProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 max-w-md rounded-lg bg-white p-6 text-center shadow-xl">
        <div className="mb-4 text-6xl">🎉</div>
        <h2 className="mb-2 text-2xl font-bold text-green-600">¡Pago exitoso!</h2>
        <p className="mb-4 text-gray-600">
          Tu pago con Stripe se procesó correctamente. Podrás descargar tu comprobante con código
          QR.
        </p>
        <div className="mb-4 rounded-lg bg-green-50 p-3">
          <p className="text-sm text-green-700">
            ✅ Pago confirmado
            <br />
            � Comprobante con QR disponible
            <br />
            🎫 Tu entrada está lista para usar
          </p>
        </div>
        <button
          onClick={onContinue}
          className="w-full rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
