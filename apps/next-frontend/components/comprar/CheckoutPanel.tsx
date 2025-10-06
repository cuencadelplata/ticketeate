"use client";

import React from "react";

type CheckoutPanelProps = {
  cantidad: number;
  setCantidad: (n: number) => void;
  metodo: string;
  setMetodo: (m: string) => void;
  isCardPayment: boolean;
  cardNumber: string;
  setCardNumber: (v: string) => void;
  cardExpiry: string;
  setCardExpiry: (v: string) => void;
  cardCvv: string;
  setCardCvv: (v: string) => void;
  cardDni: string;
  setCardDni: (v: string) => void;
  isValidCardInputs: () => boolean;
  precioUnitario: number;
  feeUnitario: number;
  total: number;
  currency: 'ARS' | 'USD' | 'EUR';
  formatPrice: (n: number) => string;
  onCurrencyChange: (c: 'ARS' | 'USD' | 'EUR') => void;
  onReservar?: () => void;
  onComprar: () => void;
  loading: boolean;
  showSuccess: boolean;
  error: string | null;
  resetForm: () => void;
  isReservationActive?: boolean;
  timeLeft?: number;
};

export function CheckoutPanel(props: CheckoutPanelProps) {
  const {
    cantidad,
    setCantidad,
    metodo,
    setMetodo,
    isCardPayment,
    cardNumber,
    setCardNumber,
    cardExpiry,
    setCardExpiry,
    cardCvv,
    setCardCvv,
    cardDni,
    setCardDni,
    isValidCardInputs,
    precioUnitario,
    feeUnitario,
    total,
    formatPrice,
    currency,
    onCurrencyChange,
    onReservar,
    onComprar,
    loading,
    showSuccess,
    error,
    resetForm,
    isReservationActive,
    timeLeft,
  } = props;

  return (
    <div className="rounded-b-2xl border-t border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700">Cantidad</label>
        <select
          value={String(cantidad)}
          onChange={(e) => setCantidad(parseInt(e.target.value || '1'))}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          disabled={showSuccess}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700">Método de pago</label>
        <select
          value={metodo}
          onChange={(e) => setMetodo(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          disabled={showSuccess}
        >
          <option value="tarjeta_debito">Tarjeta de Débito</option>
          <option value="tarjeta_credito">Tarjeta de Crédito</option>
          <option value="stripe">Stripe</option>
          <option value="mercado_pago">Mercado Pago</option>
        </select>
      </div>

      <div className="mb-3 flex flex-col">
        <label className="mb-1 text-xs font-medium text-gray-700">Moneda</label>
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as any)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          disabled={showSuccess || metodo === 'mercado_pago' || metodo === 'stripe'}
        >
          <option value="ARS">ARS (Peso)</option>
          <option value="USD">USD (Dólar)</option>
          <option value="EUR">EUR (Euro)</option>
        </select>
        <span className="mt-1 text-[11px] text-gray-500">
          Mercado Pago: ARS fijo. Stripe: USD fijo. Tarjeta crédito/débito: elegí ARS, USD o EUR.
        </span>
      </div>

      {isCardPayment ? (
        <div className="mb-3 space-y-3 rounded-xl border border-gray-200 bg-white p-3">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-gray-700">Número de tarjeta</label>
            <input type="text" inputMode="numeric" autoComplete="cc-number" placeholder="#### #### #### ####" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 flex flex-col">
              <label className="mb-1 text-xs font-medium text-gray-700">Vencimiento (MM/AA)</label>
              <input type="text" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-1 flex flex-col">
              <label className="mb-1 text-xs font-medium text-gray-700">CVV</label>
              <input type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="3 o 4 dígitos" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-1 flex flex-col">
              <label className="mb-1 text-xs font-medium text-gray-700">DNI</label>
              <input type="text" inputMode="numeric" placeholder="Solo números" value={cardDni} onChange={(e) => setCardDni(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {!isValidCardInputs() && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-800">Verifica número, vencimiento, CVV y DNI.</div>
          )}
        </div>
      ) : (
        (metodo === 'stripe' || metodo === 'mercado_pago') && (
          <div className="mb-3 space-y-2 rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-sm text-gray-700">
              Pagarás con <span className="font-semibold">{metodo === 'stripe' ? 'Stripe' : 'Mercado Pago'}</span>.
            </div>
            <div className="text-xs text-gray-500">Al hacer clic en "Pagar" te redirigiremos al proveedor seleccionado.</div>
          </div>
        )
      )}

      <div className="mb-3 flex items-start justify-between rounded-xl border border-gray-200 bg-white px-3 py-3">
        <div>
          <div className="text-xs text-gray-500">Precio base (unitario)</div>
          <div className="font-bold">{formatPrice(Math.max(precioUnitario - feeUnitario, 0))}</div>
          <div className="mt-1 text-xs text-gray-500">Tarifa de servicio (unitario)</div>
          <div className="text-sm font-semibold text-gray-700">{formatPrice(feeUnitario)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Total a pagar</div>
          <div className="text-lg font-extrabold text-blue-900">{formatPrice(total)}</div>
          <div className="text-xs text-blue-600">
            {formatPrice(Math.max(precioUnitario - feeUnitario, 0) * cantidad)} + {formatPrice(feeUnitario * cantidad)} = {formatPrice(total)}
          </div>
        </div>
      </div>

      {!showSuccess ? (
        <div className="space-y-2">
          {!isReservationActive ? (
            <button
              onClick={onReservar}
              className="inline-flex w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-60"
            >
              Reservar temporalmente
            </button>
          ) : (
            <button
              onClick={onComprar}
              disabled={loading || (isCardPayment && !isValidCardInputs()) || (timeLeft !== undefined && timeLeft === 0)}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {loading
                ? 'Procesando...'
                : (isCardPayment && !isValidCardInputs())
                  ? 'Completa los datos de tarjeta'
                  : timeLeft === 0
                    ? 'Reserva expirada'
                    : 'Pagar'}
            </button>
          )}
        </div>
      ) : (
        <button onClick={resetForm} className="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700">Comprar más entradas</button>
      )}

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-center text-sm text-red-600">❌ {error}</p>
        </div>
      )}
    </div>
  );
}


