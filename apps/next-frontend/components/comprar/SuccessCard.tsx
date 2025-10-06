'use client';

import React from 'react';

type SuccessCardProps = {
  cantidad: number;
  total: number;
  sectorNombre: string;
  metodo: string;
  reservaId?: string | number;
  onDescargarPDF: () => void;
  formatARS: (n: number) => string;
};

export function SuccessCard({
  cantidad,
  total,
  sectorNombre,
  metodo,
  reservaId,
  onDescargarPDF,
  formatARS,
}: SuccessCardProps) {
  return (
    <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
      <div className="mb-2 text-4xl">🎉</div>
      <h3 className="mb-2 text-lg font-bold text-green-800">¡Compra exitosa!</h3>
      <div className="space-y-1 text-sm text-green-700">
        <p>
          ✅ {cantidad} entrada(s) para {sectorNombre}
        </p>
        <p>💰 Total: {formatARS(total)}</p>
        <p>
          💳 Método: {metodo === 'tarjeta_credito' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}
        </p>
        <p>🆔 Reserva: #{reservaId}</p>
      </div>
      <div className="mt-3 text-xs text-green-600">
        Se han generado {cantidad} código(s) QR para tu entrada
      </div>
      <div className="mt-3 text-xs font-medium text-blue-600">
        ⏱️ Serás redirigido al menú principal en 10 segundos. Puedes descargar tu comprobante ahora.
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button
          onClick={onDescargarPDF}
          className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          Descargar comprobante (PDF)
        </button>
      </div>
    </div>
  );
}
