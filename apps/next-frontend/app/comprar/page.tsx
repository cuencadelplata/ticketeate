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

  // 🔻 ancho igual; ahora ocupa casi toda la altura visible
  sidebar: {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 14px rgba(0,0,0,.06)',
    width: 600,
    height: '88vh',        // << ocupa alto de pantalla
    maxHeight: '88vh',
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

  // 🔻 la lista ahora crece y scrollea en todo el espacio disponible
  list: {
    flex: 1,               // << ocupa el espacio sobrante
    overflowY: 'auto',
    padding: 8,
  },

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
  colorDot: { width: 14, height: 14, borderRadius: 4, border: '1px solid rgba(0,0,0,.12)' },
  cardBody: { display: 'flex', flexDirection: 'column' },
  cardTitle: { fontWeight: 700, color: '#000' },
  cardPrice: { fontSize: 13, color: '#000', marginTop: 2 },
  cardMeta: { fontSize: 12, color: '#000', marginTop: 2 },
  radio: { width: 16, height: 16 },

  // 🔻 el checkout se “pega” al fondo del sidebar
  checkout: {
    marginTop: 'auto',     // << empuja hacia abajo
    padding: 16,
    borderTop: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    background: '#fff',
  },

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
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'opacity .2s',
  },

  error: { color: 'tomato', fontSize: '0.9rem', textAlign: 'center' as const },
  result: { whiteSpace: 'pre-wrap' as const, background: '#111', color: '#eee', padding: '12px', borderRadius: 8, fontSize: '0.9rem' },
};
