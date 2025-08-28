"use client";

import { useMemo, useState } from "react";

type SectorKey = "Entrada_General" | "Entrada_VIP";

const SECTORES: Record<
  SectorKey,
  { nombre: string; precioDesde: number; fee?: number; numerado: boolean; color: string }
> = {
  Entrada_General: {
    nombre: "Entrada General",
    precioDesde: 85000,
    fee: 12000,
    numerado: false,
    color: "#a5d6a7",
  },
  Entrada_VIP: {
    nombre: "Entrada V.I.P",
    precioDesde: 180000,
    fee: 27000,
    numerado: true,
    color: "#43a047",
  },
};

export default function ComprarPage() {
  const [idUsuario] = useState<number>(1);
  const [idEvento] = useState<number>(1);

  const [cantidad, setCantidad] = useState<number>(1);
  const [metodo, setMetodo] = useState<string>("EFECTIVO");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [sector, setSector] = useState<SectorKey>("Entrada_General");

  const formatARS = (n: number) =>
    n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

  // Texto como en la lista (“Desde $ … + $ …”)
  const precioTexto = useMemo(() => {
    const s = SECTORES[sector];
    const base = s.precioDesde.toLocaleString("es-AR");
    const fee = s.fee ? s.fee.toLocaleString("es-AR") : "0";
    return `Desde $ ${base}${s.fee ? ` + $ ${fee},00` : ""}`;
  }, [sector]);

  // Precio unitario (base + fee) y total según cantidad
  const { precioUnitario, total } = useMemo(() => {
    const s = SECTORES[sector];
    const unit = s.precioDesde + (s.fee || 0);
    return { precioUnitario: unit, total: unit * cantidad };
  }, [sector, cantidad]);

  const comprar = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch("/api/comprar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: idUsuario,
          id_evento: idEvento,
          cantidad,
          metodo_pago: metodo,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setResultado({ ...data, ui_sector: SECTORES[sector].nombre, ui_total: total });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-black flex justify-center p-6">
      <aside className="w-[600px] h-[88vh] max-h-[88vh] bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <span className="font-bold">Seleccionar sector</span>
          <button
            className="text-orange-500 font-semibold hover:underline"
            onClick={() => setSector("Entrada_General")}
          >
            Limpiar selección
          </button>
        </div>

        {/* Lista de sectores */}
        <div className="flex-1 overflow-y-auto p-2">
          {(Object.keys(SECTORES) as SectorKey[]).map((key) => {
            const s = SECTORES[key];
            const activo = key === sector;
            return (
              <label
                key={key}
                className={`grid [grid-template-columns:24px_1fr_auto] gap-3 items-center p-3 rounded-xl border cursor-pointer m-1
                ${activo ? "bg-blue-50 ring-2 ring-blue-500 border-transparent" : "bg-white border-gray-200"}`}
              >
                <div className="flex items-center justify-center">
                  <span
                    className="inline-block w-3.5 h-3.5 rounded border border-black/10"
                    style={{ background: s.color }}
                  />
                </div>

                <div className="flex flex-col">
                  <div className="font-bold">{s.nombre}</div>
                  <div className="text-sm mt-0.5">
                    Desde $ {s.precioDesde.toLocaleString("es-AR")}
                    {s.fee ? ` + $ ${s.fee.toLocaleString("es-AR")},00` : ""}
                  </div>
                  <div className="text-xs mt-0.5">{s.numerado ? "🔢 Numerado" : "🔘 Sin numerar"}</div>
                </div>

                <input
                  type="radio"
                  name="sector"
                  checked={activo}
                  onChange={() => setSector(key)}
                  className="w-4 h-4"
                />
              </label>
            );
          })}
        </div>

        {/* Checkout */}
        <div className="mt-auto bg-white border-t border-gray-200 p-4 flex flex-col gap-3">
          {/* Cantidad */}
          <div className="flex flex-col">
            <label className="text-xs mb-1">Cantidad</label>
            <select
              value={String(cantidad)}
              onChange={(e) => setCantidad(parseInt(e.target.value || "1"))}
              className="px-3 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Método */}
          <div className="flex flex-col">
            <label className="text-xs mb-1">Método</label>
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              className="px-3 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          {/* Info selección */}
          <div className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
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
          <div className="mt-1 border border-dashed border-slate-300 bg-slate-50 rounded-xl px-3 py-3 flex items-center justify-between gap-2">
            <div className="font-semibold">Total a pagar</div>
            <div className="text-right">
              <div className="font-extrabold text-lg">{formatARS(total)}</div>
              <div className="text-xs text-slate-600">
                {cantidad} × {formatARS(precioUnitario)}
              </div>
            </div>
          </div>

          <button
            onClick={comprar}
            disabled={loading}
            className="mt-1 inline-flex justify-center items-center px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Comprando..." : "Comprar"}
          </button>

          {error && <p className="text-center text-[0.9rem] text-red-500">{error}</p>}
          {resultado && (
            <pre className="whitespace-pre-wrap bg-black text-gray-100 p-3 rounded-lg text-sm">
              {JSON.stringify(resultado, null, 2)}
            </pre>
          )}
        </div>
      </aside>
    </div>
  );
}
