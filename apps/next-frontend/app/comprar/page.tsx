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
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <span style={{ fontWeight: 700, color: "#000" }}>Seleccionar sector</span>
          <button style={styles.clearBtn} onClick={() => setSector("Entrada_General")}>
            Limpiar selección
          </button>
        </div>

        <div style={styles.list}>
          {(Object.keys(SECTORES) as SectorKey[]).map((key) => {
            const s = SECTORES[key];
            const activo = key === sector;
            return (
              <label key={key} style={{ ...styles.card, ...(activo ? styles.cardActive : {}) }}>
                <div style={styles.cardLeft}>
                  <span style={{ ...styles.colorDot, background: s.color }} />
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTitle}>{s.nombre}</div>
                  <div style={styles.cardPrice}>
                    Desde $ {s.precioDesde.toLocaleString("es-AR")}
                    {s.fee ? ` + $ ${s.fee.toLocaleString("es-AR")},00` : ""}
                  </div>
                  <div style={styles.cardMeta}>{s.numerado ? "🔢 Numerado" : "🔘 Sin numerar"}</div>
                </div>
                <input
                  type="radio"
                  name="sector"
                  checked={activo}
                  onChange={() => setSector(key)}
                  style={styles.radio}
                />
              </label>
            );
          })}
        </div>

        {/* Bloque de compra */}
        <div style={styles.checkout}>
          <div style={styles.block}>
            <label style={styles.labelMini}>Cantidad</label>
            <select
              value={String(cantidad)}
              onChange={(e) => setCantidad(parseInt(e.target.value || "1"))}
              style={styles.input}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.block}>
            <label style={styles.labelMini}>Método</label>
            <select value={metodo} onChange={(e) => setMetodo(e.target.value)} style={styles.input}>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          {/* Info seleccion */}
          <div style={styles.totalLine}>
            <div>
              <div style={styles.totalLabel}>Sector</div>
              <div style={styles.totalValue}>{SECTORES[sector].nombre}</div>
            </div>
            <div>
              <div style={styles.totalLabel}>Precio unitario</div>
              <div style={styles.totalValue}>{formatARS(precioUnitario)}</div>
            </div>
          </div>

          {/* TOTAL calculado */}
          <div style={styles.grandTotal}>
            <div style={{ fontWeight: 600, color: "#000" }}>Total a pagar</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{formatARS(total)}</div>
            <div style={{ fontSize: 12, color: "#555" }}>
              {cantidad} × {formatARS(precioUnitario)}
            </div>
          </div>

          <button onClick={comprar} disabled={loading} style={styles.buyBtn}>
            {loading ? "Comprando..." : "Comprar"}
          </button>

          {error && <p style={styles.error}>{error}</p>}
          {resultado && <pre style={styles.result}>{JSON.stringify(resultado, null, 2)}</pre>}
        </div>
      </aside>
    </div>
  );
}

const styles: Record<string, React.CSSProperties | any> = {
  page: {
    fontFamily: "Inter, system-ui, Arial, sans-serif",
    background: "#f5f7fb",
    minHeight: "100vh",
    padding: "24px",
    display: "flex",
    justifyContent: "center",
    color: "#000",
  },
  sidebar: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 14px rgba(0,0,0,.06)",
    width: 600,
    height: "88vh",
    maxHeight: "88vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarHeader: {
    padding: "14px 16px",
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clearBtn: {
    background: "transparent",
    border: "none",
    color: "#e67e22",
    cursor: "pointer",
    fontWeight: 600,
  },
  list: { flex: 1, overflowY: "auto", padding: 8 },
  card: {
    display: "grid",
    gridTemplateColumns: "24px 1fr auto",
    gap: 12,
    alignItems: "center",
    padding: "12px 10px",
    borderRadius: 10,
    border: "1px solid #eee",
    background: "#fff",
    margin: 6,
    cursor: "pointer",
  },
  cardActive: { outline: "2px solid #4c8bf5", background: "#f2f7ff" },
  cardLeft: { display: "flex", alignItems: "center", justifyContent: "center" },
  colorDot: { width: 14, height: 14, borderRadius: 4, border: "1px solid rgba(0,0,0,.12)" },
  cardBody: { display: "flex", flexDirection: "column" },
  cardTitle: { fontWeight: 700, color: "#000" },
  cardPrice: { fontSize: 13, color: "#000", marginTop: 2 },
  cardMeta: { fontSize: 12, color: "#000", marginTop: 2 },
  radio: { width: 16, height: 16 },
  checkout: {
    marginTop: "auto",
    padding: 16,
    borderTop: "1px solid #eee",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    background: "#fff",
  },
  block: { display: "flex", flexDirection: "column" },
  labelMini: { fontSize: 12, color: "#000", marginBottom: 6 },
  input: {
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 14,
    background: "#fafafa",
    color: "#000",
  },
  totalLine: {
    display: "flex",
    justifyContent: "space-between",
    background: "#fafafa",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: "12px 14px",
    marginTop: 4,
    color: "#000",
  },
  totalLabel: { fontSize: 12, color: "#000" },
  totalValue: { fontSize: 15, fontWeight: 700, color: "#000" },
  grandTotal: {
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px dashed #cfd8dc",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  buyBtn: {
    padding: "14px",
    fontSize: "1rem",
    color: "#fff",
    backgroundColor: "#007BFF",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "opacity .2s",
  },
  error: { color: "tomato", fontSize: "0.9rem", textAlign: "center" as const },
  result: {
    whiteSpace: "pre-wrap" as const,
    background: "#111",
    color: "#eee",
    padding: "12px",
    borderRadius: 8,
    fontSize: "0.9rem",
  },
};
