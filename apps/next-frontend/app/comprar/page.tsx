'use client';

import { useMemo, useState } from 'react';

type SectorKey =
  | 'CAMPO_DELANTERO'
  | 'CAMPO_GENERAL'
  | 'PLATEA_BELGRANO_ALTA'
  | 'PLATEA_PREF_BAJA'
  | 'PLATEA_PREF_INFERIOR'
  | 'PLATEA_PREF_MEDIA';

const SECTORES: Record<
  SectorKey,
  { nombre: string; precioDesde: number; fee?: number; numerado: boolean; color: string }
> = {
  CAMPO_DELANTERO: { nombre: 'Campo Delantero', precioDesde: 180000, fee: 27000, numerado: false, color: '#a5d6a7' },
  CAMPO_GENERAL: { nombre: 'Campo General', precioDesde: 85000, fee: 12750, numerado: false, color: '#43a047' },
  PLATEA_BELGRANO_ALTA: { nombre: 'Platea Belgrano Alta', precioDesde: 125000, fee: 18750, numerado: false, color: '#90caf9' },
  PLATEA_PREF_BAJA: { nombre: 'Platea Preferencial Belgrano Baja', precioDesde: 200000, fee: 30000, numerado: true, color: '#80cbc4' },
  PLATEA_PREF_INFERIOR: { nombre: 'Platea Preferencial Belgrano Inferior', precioDesde: 200000, fee: 30000, numerado: true, color: '#b39ddb' },
  PLATEA_PREF_MEDIA: { nombre: 'Platea Preferencial Belgrano Media', precioDesde: 200000, fee: 30000, numerado: true, color: '#ffcc80' },
};

export default function ComprarPage() {
  const [idUsuario] = useState<number>(1);
  const [idEvento] = useState<number>(1);

  const [cantidad, setCantidad] = useState<number>(1);
  const [metodo, setMetodo] = useState<string>('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [sector, setSector] = useState<SectorKey>('CAMPO_GENERAL');

  const precioTexto = useMemo(() => {
    const s = SECTORES[sector];
    const base = s.precioDesde.toLocaleString('es-AR');
    const fee = s.fee ? s.fee.toLocaleString('es-AR') : '0';
    return `Desde $ ${base}${s.fee ? ` + $ ${fee},00` : ''}`;
  }, [sector]);

  const comprar = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
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
      setResultado({ ...data, ui_sector: SECTORES[sector].nombre });
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
          <span style={{ fontWeight: 700, color: '#000' }}>Seleccionar sector</span>
          <button style={styles.clearBtn} onClick={() => setSector('CAMPO_GENERAL')}>
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
                    Desde $ {s.precioDesde.toLocaleString('es-AR')}
                    {s.fee ? ` + $ ${s.fee.toLocaleString('es-AR')},00` : ''}
                  </div>
                  <div style={styles.cardMeta}>
                    {s.numerado ? '🔢 Numerado' : '🔘 Sin numerar'}
                  </div>
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

        {/* Bloque de compra (inputs uno debajo del otro) */}
        <div style={styles.checkout}>
          <div style={styles.block}>
            <label style={styles.labelMini}>Cantidad</label>
            <select
              value={String(cantidad)}
              onChange={(e) => setCantidad(parseInt(e.target.value || '1'))}
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
            <select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              style={styles.input}
            >
              <option value="EFECTIVO">Efectivo</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          <div style={styles.totalLine}>
            <div>
              <div style={styles.totalLabel}>Sector</div>
              <div style={styles.totalValue}>{SECTORES[sector].nombre}</div>
            </div>
            <div>
              <div style={styles.totalLabel}>Precio</div>
              <div style={styles.totalValue}>{precioTexto}</div>
            </div>
          </div>

          <button onClick={comprar} disabled={loading} style={styles.buyBtn}>
            {loading ? 'Comprando...' : 'Comprar'}
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
    fontFamily: 'Inter, system-ui, Arial, sans-serif',
    background: '#f5f7fb',
    minHeight: '100vh',
    padding: '24px',
    display: 'flex',
    justifyContent: 'center',
    color: '#000',
  },
  sidebar: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 14px rgba(0,0,0,.06)',
    width: 600,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sidebarHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearBtn: {
    background: 'transparent',
    border: 'none',
    color: '#e67e22',
    cursor: 'pointer',
    fontWeight: 600,
  },

  list: { overflowY: 'auto', maxHeight: 340, padding: 8 },
  card: {
    display: 'grid',
    gridTemplateColumns: '24px 1fr auto',
    gap: 12,
    alignItems: 'center',
    padding: '12px 10px',
    borderRadius: 10,
    border: '1px solid #eee',
    background: '#fff',
    margin: 6,
    cursor: 'pointer',
  },
  cardActive: { outline: '2px solid #4c8bf5', background: '#f2f7ff' },
  cardLeft: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  colorDot: { width: 14, height: 14, borderRadius: 4, border: '1px solid rgba(0,0,0,.12)', display: 'inline-block' },
  cardBody: { display: 'flex', flexDirection: 'column' },
  cardTitle: { fontWeight: 700, color: '#000' },
  cardPrice: { fontSize: 13, color: '#000', marginTop: 2 },
  cardMeta: { fontSize: 12, color: '#000', marginTop: 2 },
  radio: { width: 16, height: 16 },

  checkout: { padding: 16, borderTop: '1px solid #eee', display: 'flex', flexDirection: 'column', gap: 14 },
  block: { display: 'flex', flexDirection: 'column' },
  labelMini: { fontSize: 12, color: '#000', marginBottom: 6 },
  input: {
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #ddd',
    fontSize: 14,
    background: '#fafafa',
    color: '#000',
  },

  totalLine: {
    display: 'flex',
    justifyContent: 'space-between',
    background: '#fafafa',
    border: '1px solid #eee',
    borderRadius: 10,
    padding: '12px 14px',
    marginTop: 4,
    color: '#000',
  },
  totalLabel: { fontSize: 12, color: '#000' },
  totalValue: { fontSize: 15, fontWeight: 700, color: '#000' },

  buyBtn: {
    padding: '14px',
    fontSize: '1rem',
    color: '#fff',
    backgroundColor: '#0032A0', // '#0  07BFF',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'opacity .2s',
  },

  error: { color: 'tomato', fontSize: '0.9rem', textAlign: 'center' as const },
  result: { whiteSpace: 'pre-wrap' as const, background: '#111', color: '#eee', padding: '12px', borderRadius: 8, fontSize: '0.9rem' },
};
