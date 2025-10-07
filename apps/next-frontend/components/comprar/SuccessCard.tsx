'use client';

import React from 'react';

type SuccessCardProps = {
  cantidad: number;
  total: number;
  sectorNombre: string;
  metodo: string;
  reservaId?: string | number;
  onDescargarPDF: () => void;
  onVolverAlMenu?: () => void;
  formatARS: (n: number) => string;
};

export function SuccessCard({
  cantidad,
  total,
  sectorNombre,
  metodo,
  reservaId,
  onDescargarPDF,
  onVolverAlMenu,
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
          💳 Método:{' '}
          {metodo === 'tarjeta_credito'
            ? 'Tarjeta de Crédito'
            : metodo === 'tarjeta_debito'
              ? 'Tarjeta de Débito'
              : metodo === 'stripe'
                ? 'Stripe'
                : metodo === 'mercado_pago'
                  ? 'Mercado Pago'
                  : metodo}
        </p>
        <p>🆔 Reserva: #{reservaId}</p>
      </div>
      <div className="mt-3 text-xs text-green-600">
        Se han generado {cantidad} código(s) QR para tu entrada
      </div>
      <div className="mt-3 text-xs font-medium text-green-600">
        ✅ Tu compra se procesó exitosamente.
      </div>

      {/* Botón de descarga del comprobante - más prominente */}
      <div className="mt-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3">
        <p className="mb-2 text-xs font-medium text-green-800">📋 Tu comprobante está listo</p>
        <button
          onClick={onDescargarPDF}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Descargar comprobante con QR
        </button>
        <p className="mt-2 text-xs text-green-600">Incluye código QR para acceso al evento</p>
      </div>

      {/* Botón secundario para volver al menú */}
      {onVolverAlMenu && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={onVolverAlMenu}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Volver al menú principal
          </button>
        </div>
      )}
    </div>
  );
}
