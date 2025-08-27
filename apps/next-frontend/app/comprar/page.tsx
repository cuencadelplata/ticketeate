'use client';

import { useState } from 'react';

export default function ComprarPage() {
  const [idUsuario, setIdUsuario] = useState<number>(1);
  const [idEvento, setIdEvento] = useState<number>(1);
  const [cantidad, setCantidad] = useState<number>(1);
  const [metodo, setMetodo] = useState<string>('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
      setResultado(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Probar compra</h1>
      <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
        <label>
          Usuario ID
          <input
            type="number"
            value={idUsuario}
            onChange={e => setIdUsuario(parseInt(e.target.value || '0'))}
          />
        </label>
        <label>
          Evento ID
          <input
            type="number"
            value={idEvento}
            onChange={e => setIdEvento(parseInt(e.target.value || '0'))}
          />
        </label>
        <label>
          Cantidad
          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={e => setCantidad(parseInt(e.target.value || '1'))}
          />
        </label>
        <label>
          Método de pago
          <input value={metodo} onChange={e => setMetodo(e.target.value)} />
        </label>

        <button onClick={comprar} disabled={loading}>
          {loading ? 'Comprando...' : 'Comprar'}
        </button>

        {error && <p style={{ color: 'tomato' }}>{error}</p>}
        {resultado && (
          <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#eee', padding: 12 }}>
            {JSON.stringify(resultado, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
