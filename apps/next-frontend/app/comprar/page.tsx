'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  const router = useRouter();
  const [idUsuario] = useState<number>(1);
  const [idEvento] = useState<number>(1);

  const [cantidad, setCantidad] = useState<number>(1);
  const [metodo, setMetodo] = useState<string>('efectivo');
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

    const datosCompra = {
      id_usuario: idUsuario,
      id_evento: idEvento,
      cantidad,
      metodo_pago: metodo,
    };

    console.log('Enviando datos a la API:', datosCompra);

    try {
      const res = await fetch('/api/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosCompra),
      });

      console.log('Respuesta de la API:', res.status, res.statusText);

      const data = await res.json();
      console.log('Datos recibidos:', data);

      if (!res.ok) throw new Error(data.error || 'Error');

      setResultado({ ...data, ui_sector: SECTORES[sector].nombre, ui_total: total });
      setShowSuccess(true);

      // Resetear formulario después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
        setResultado(null);
        setCantidad(1);
        setSector('Entrada_General');
        setMetodo('efectivo');
        router.push('/'); // Redirigir al menú principal
      }, 3000);
    } catch (e: any) {
      console.error('Error en compra:', e);
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
    <div className="min-h-screen bg-[#f5f7fb] p-4 text-black">
      {/* Contenedor principal con scroll */}
      <div className="mx-auto max-w-[1200px] space-y-4">
        {/* Header de la página */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Comprar Entradas</h1>
          <p className="text-gray-600">Selecciona tu sector y completa tu compra</p>
        </div>

        {/* Contenedor de 2 columnas: mapa (izq) + panel (der) */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_600px]">
          {/* IZQUIERDA: Mapa referencial */}
          <section className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-md">
            <div className="w-full max-w-[600px]">
              <Image
                src="/mapa-referencial.png"
                alt="Mapa referencial de sectores"
                width={800}
                height={600}
                className="w-full rounded-lg border object-contain"
              />
              <span className="mt-2 block text-center text-sm font-semibold text-gray-600">
                Mapa referencial
              </span>
            </div>
          </section>

          {/* DERECHA: Sidebar de selección y compra */}
          <aside className="flex flex-col rounded-2xl bg-white shadow-md">
            {/* Header fijo */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="font-bold">Seleccionar sector</span>
              <button className="font-semibold text-orange-500 hover:underline" onClick={resetForm}>
                Limpiar selección
              </button>
            </div>

            {/* Lista de sectores con scroll */}
            <div className="max-h-[300px] flex-1 overflow-y-auto p-2">
              {(Object.keys(SECTORES) as SectorKey[]).map((key) => {
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
                        : 'border-gray-200 hover:bg-gray-50',
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

            {/* Checkout fijo en la parte inferior */}
            <div className="rounded-b-2xl border-t border-gray-200 bg-gray-50 p-4">
              {/* Cantidad */}
              <div className="mb-3 flex flex-col">
                <label className="mb-1 text-xs font-medium text-gray-700">Cantidad</label>
                <select
                  value={String(cantidad)}
                  onChange={(e) => setCantidad(parseInt(e.target.value || '1'))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={showSuccess}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Método */}
              <div className="mb-3 flex flex-col">
                <label className="mb-1 text-xs font-medium text-gray-700">Método de pago</label>
                <select
                  value={metodo}
                  onChange={(e) => setMetodo(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={showSuccess}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              {/* Info selección */}
              <div className="mb-3 flex items-start justify-between rounded-xl border border-gray-200 bg-white px-3 py-3">
                <div>
                  <div className="text-xs text-gray-500">Sector</div>
                  <div className="font-bold">{SECTORES[sector].nombre}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Precio unitario</div>
                  <div className="font-bold">{formatARS(precioUnitario)}</div>
                </div>
              </div>

              {/* Total */}
              <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-3 py-3">
                <div className="font-semibold text-blue-800">Total a pagar</div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-blue-900">{formatARS(total)}</div>
                  <div className="text-xs text-blue-600">
                    {cantidad} × {formatARS(precioUnitario)}
                  </div>
                </div>
              </div>

              {/* Botón de compra */}
              {!showSuccess ? (
                <button
                  onClick={comprar}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? 'Comprando...' : 'Comprar'}
                </button>
              ) : (
                <button
                  onClick={resetForm}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700"
                >
                  Comprar más entradas
                </button>
              )}

              {/* Mensajes de error y éxito */}
              {error && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-center text-sm text-red-600">❌ {error}</p>
                </div>
              )}

              {showSuccess && resultado && (
                <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                  <div className="mb-2 text-4xl">🎉</div>
                  <h3 className="mb-2 text-lg font-bold text-green-800">¡Compra exitosa!</h3>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>
                      ✅ {cantidad} entrada(s) para {SECTORES[sector].nombre}
                    </p>
                    <p>💰 Total: {formatARS(total)}</p>
                    <p>💳 Método: {metodo}</p>
                    <p>🆔 Reserva: #{resultado.reserva?.id_reserva}</p>
                  </div>
                  <div className="mt-3 text-xs text-green-600">
                    Se han generado {cantidad} código(s) QR para tu entrada
                  </div>
                  <div className="mt-3 text-xs font-medium text-blue-600">
                    ⏱️ Serás redirigido al menú principal en 3 segundos...
                  </div>
                  <div className="mt-3 text-xs font-medium text-blue-600">
                    ⏱️ Serás redirigido al menú principal en 3 segundos...
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
