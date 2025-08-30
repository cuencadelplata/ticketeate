'use client';

import { useMemo, useState } from 'react';

type SectorKey = 'Entrada_General' | 'Entrada_VIP';

const SECTORES: Record<
  SectorKey,
  { nombre: string; precioDesde: number; fee?: number; numerado: boolean; color: string }
> = {
  Entrada_General: {
    nombre: 'Entrada General',
    precioDesde: 85000,
    fee: 12000,
    numerado: false,
    color: '#a5d6a7',
  },
  Entrada_VIP: {
    nombre: 'Entrada V.I.P',
    precioDesde: 180000,
    fee: 27000,
    numerado: true,
    color: '#43a047',
  },
};

export default function ComprarPage() {
  const [idUsuario] = useState<number>(1);
  const [idEvento] = useState<number>(1);

  const [cantidad, setCantidad] = useState<number>(1);
  const [metodo, setMetodo] = useState<string>('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [sector, setSector] = useState<SectorKey>('Entrada_General');

  // Simulación de disponibilidad por sector
  const DISPONIBILIDAD: Record<SectorKey, number> = {
    Entrada_General: 120,
    Entrada_VIP: 35,
  };

  const formatARS = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  const { precioUnitario, total } = useMemo(() => {
    const s = SECTORES[sector];
    const unit = s.precioDesde + (s.fee || 0);
    return { precioUnitario: unit, total: unit * cantidad };
  }, [sector, cantidad]);

  const comprar = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
    setShowSuccess(false);
    
    try {
      const res = await fetch('/api/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: idUsuario,
          id_evento: idEvento,
          cantidad,
          metodo_pago: metodo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      
      setResultado({ ...data, ui_sector: SECTORES[sector].nombre, ui_total: total });
      setShowSuccess(true);
      
      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
        setResultado(null);
        setCantidad(1);
        setSector('Entrada_General');
        setMetodo('EFECTIVO');
      }, 3000);
      
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowSuccess(false);
    setResultado(null);
    setError(null);
    setCantidad(1);
    setSector('Entrada_General');
    setMetodo('EFECTIVO');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6 text-black">
      {/* Contenedor de 2 columnas: mapa (izq) + panel (der) */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 md:grid-cols-[minmax(360px,1fr)_600px]">
        {/* IZQUIERDA: Mapa referencial */}
        <section className="flex h-[88vh] max-h-[88vh] flex-col items-center overflow-hidden rounded-2xl bg-white p-4 shadow-md">
          <img
            src="/mapa-referencial.png"
            alt="Mapa referencial de sectores"
            className="mb-2 w-full max-w-[720px] rounded-lg border object-contain"
          />
          <span className="text-sm font-semibold text-gray-600">Mapa referencial</span>
        </section>

        {/* DERECHA: Sidebar de selección y compra (tu panel) */}
        <aside className="flex h-[88vh] max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <span className="font-bold">Seleccionar sector</span>
            <button
              className="font-semibold text-orange-500 hover:underline"
              onClick={resetForm}
            >
              Limpiar selección
            </button>
          </div>

          {/* Lista de sectores */}
          <div className="flex-1 overflow-y-auto p-2">
            {(Object.keys(SECTORES) as SectorKey[]).map(key => {
              const s = SECTORES[key];
              const activo = key === sector;
              return (
                <label
                  key={key}
                  className={[
                    'm-1 grid cursor-pointer items-center gap-3 rounded-xl border bg-white p-3',
                    '[grid-template-columns:24px_1fr_auto]',
                    activo
                      ? 'border-transparent bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-200',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-center">
                    <span
                      className="inline-block h-3.5 w-3.5 rounded border border-black/10"
                      style={{ background: s.color }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <div className="font-bold">{s.nombre}</div>
                    <div className="mt-0.5 text-sm">
                      Desde $ {s.precioDesde.toLocaleString('es-AR')}
                      {s.fee ? ` + $ ${s.fee.toLocaleString('es-AR')},00` : ''}
                    </div>
                    <div className="mt-0.5 text-xs">
                      {s.numerado ? '🔢 Numerado' : '🔘 Sin numerar'}
                      {' · '}
                      <span className="font-semibold text-green-700">
                        {DISPONIBILIDAD[key]} disponibles
                      </span>
                    </div>
                  </div>

                  <input
                    type="radio"
                    name="sector"
                    checked={activo}
                    onChange={() => setSector(key)}
                    className="h-4 w-4"
                  />
                </label>
              );
            })}
          </div>

          {/* Checkout */}
          <div className="mt-auto flex flex-col gap-3 border-t border-gray-200 bg-white p-4">
            {/* Cantidad */}
            <div className="flex flex-col">
              <label className="mb-1 text-xs">Cantidad</label>
              <select
                value={String(cantidad)}
                onChange={e => setCantidad(parseInt(e.target.value || '1'))}
                className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={showSuccess}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Método */}
            <div className="flex flex-col">
              <label className="mb-1 text-xs">Método</label>
              <select
                value={metodo}
                onChange={e => setMetodo(e.target.value)}
                className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                disabled={showSuccess}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </div>

            {/* Info selección */}
            <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
              <div>
                <div className="text-xs">Sector</div>
                <div className="font-bold">{SECTORES[sector].nombre}</div>
              </div>
              <div className="text-right">
                <div className="text-xs">Precio unitario</div>
                <div className="font-bold">{formatARS(precioUnitario)}</div>
              </div>
            </div>

            {/* Total */}
            <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3">
              <div className="font-semibold">Total a pagar</div>
              <div className="text-right">
                <div className="text-lg font-extrabold">{formatARS(total)}</div>
                <div className="text-xs text-slate-600">
                  {cantidad} × {formatARS(precioUnitario)}
                </div>
              </div>
            </div>

            {/* Botón de compra */}
            {!showSuccess ? (
              <button
                onClick={comprar}
                disabled={loading}
                className="mt-1 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Comprando...' : 'Comprar'}
              </button>
            ) : (
              <button
                onClick={resetForm}
                className="mt-1 inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
              >
                Comprar más entradas
              </button>
            )}

            {/* Mensajes de error y éxito */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-center text-sm text-red-600">❌ {error}</p>
              </div>
            )}
            
            {showSuccess && resultado && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-bold text-green-800 text-lg mb-2">¡Compra exitosa!</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>✅ {cantidad} entrada(s) para {SECTORES[sector].nombre}</p>
                  <p>💰 Total: {formatARS(total)}</p>
                  <p>💳 Método: {metodo}</p>
                  <p>🆔 Reserva: #{resultado.reserva?.id_reserva}</p>
                </div>
                <div className="mt-3 text-xs text-green-600">
                  Se han generado {cantidad} código(s) QR para tu entrada
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
