'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

type Categoria = {
  id_categoria: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock_total: number;
  stock_disponible: number;
  max_por_usuario: number;
};

export default function ComprarPage() {
  const router = useRouter();
  const search = useSearchParams();
  const [idUsuario] = useState<number>(1);
  const [idEvento, setIdEvento] = useState<string>('');
  const [eventoTitulo, setEventoTitulo] = useState<string>('');

  const [cantidad, setCantidad] = useState<number>(1);
  const [metodo, setMetodo] = useState<string>('tarjeta_debito');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const comprobanteRef = useRef<HTMLDivElement | null>(null);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriasLoading, setCategoriasLoading] = useState<boolean>(false);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<string>('');
  // Temporizador de reserva (5 minutos)
  const HOLD_SECONDS = 5 * 60;
  const [holdLeft, setHoldLeft] = useState<number>(HOLD_SECONDS);
  const [holdActive, setHoldActive] = useState<boolean>(false);

  useEffect(() => {
    const id = search.get('id_evento');
    if (id) setIdEvento(id);
  }, [search]);

  // Campos de tarjeta
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>(''); // MM/AA
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardDni, setCardDni] = useState<string>('');

  // Cargar categorías reales desde la API
  useEffect(() => {
    const load = async () => {
      if (!idEvento) return;
      try {
        setCategoriasLoading(true);
        // detalle del evento (título)
        try {
          const d = await fetch(`/api/evento/detalle?id_evento=${encodeURIComponent(idEvento)}`);
          const djson = await d.json();
          if (d.ok && djson?.titulo) setEventoTitulo(String(djson.titulo));
        } catch {}
        const res = await fetch(`/api/evento/categorias?id_evento=${encodeURIComponent(idEvento)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'No se pudieron cargar las categorías');
        const cats: Categoria[] = Array.isArray(data?.categorias) ? data.categorias : [];
        setCategorias(cats);
        if (cats.length > 0) {
          setSelectedCategoriaId(cats[0].id_categoria);
          setHoldLeft(HOLD_SECONDS);
          setHoldActive(true);
        } else {
          setSelectedCategoriaId('');
          setHoldActive(false);
        }
      } catch (e: any) {
        setError(e?.message || 'Error cargando categorías');
      } finally {
        setCategoriasLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idEvento]);

  // Reiniciar temporizador al cambiar de categoría
  useEffect(() => {
    if (!selectedCategoriaId) return;
    setHoldLeft(HOLD_SECONDS);
    setHoldActive(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoriaId]);

  // Tick del temporizador
  useEffect(() => {
    if (!holdActive || showSuccess) return;
    const interval = setInterval(() => {
      setHoldLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHoldActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [holdActive, showSuccess]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const formatARS = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  const selectedCategoria = useMemo(
    () => categorias.find((c) => c.id_categoria === selectedCategoriaId) || categorias[0],
    [categorias, selectedCategoriaId],
  );

  const { precioUnitario, total } = useMemo(() => {
    const unit = selectedCategoria ? Number(selectedCategoria.precio) : 0;
    return { precioUnitario: unit, total: unit * cantidad };
  }, [selectedCategoria, cantidad]);

  const maxCantidad = useMemo(() => {
    if (!selectedCategoria) return 1;
    const limites = [
      Number(selectedCategoria.max_por_usuario || 1),
      Number(selectedCategoria.stock_disponible || 0),
      5,
    ];
    const max = Math.max(1, Math.min(...limites));
    return max;
  }, [selectedCategoria]);

  const isCardPayment = metodo === 'tarjeta_credito' || metodo === 'tarjeta_debito';

  const sanitizeNumber = (v: string) => v.replace(/[^0-9]/g, '');
  const formatCardNumber = (v: string) => {
    const digits = sanitizeNumber(v).slice(0, 19);
    const groups = digits.match(/\d{1,4}/g);
    return groups ? groups.join(' ') : '';
  };
  const formatExpiry = (v: string) => {
    const digits = sanitizeNumber(v).slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const isValidCardInputs = () => {
    if (!isCardPayment) return true;
    const numberOk =
      sanitizeNumber(cardNumber).length >= 13 && sanitizeNumber(cardNumber).length <= 19;
    const expMatch = cardExpiry.match(/^\s*(0[1-9]|1[0-2])\/(\d{2})\s*$/);
    const cvvOk = /^\d{3,4}$/.test(cardCvv.trim());
    const dniOk = /^\d{7,10}$/.test(cardDni.trim());
    return Boolean(numberOk && expMatch && cvvOk && dniOk);
  };

  const comprar = async () => {
    setLoading(true);
    setError(null);
    setResultado(null);
    setShowSuccess(false);

    if (isCardPayment && !isValidCardInputs()) {
      setLoading(false);
      setError('Completa correctamente número, vencimiento (MM/AA), CVV y DNI.');
      return;
    }

    const categoriaId = selectedCategoria?.id_categoria;
    const datosCompra = {
      id_usuario: idUsuario,
      id_evento: idEvento,
      cantidad,
      metodo_pago: metodo,
      id_categoria: categoriaId,
      // En un futuro, mapear sector -> categoria en DB
      // id_categoria: ...
      datos_tarjeta: isCardPayment
        ? {
            numero: sanitizeNumber(cardNumber),
            vencimiento: cardExpiry.trim(),
            cvv: cardCvv.trim(),
            dni: cardDni.trim(),
          }
        : undefined,
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

      setResultado({ ...data, ui_sector: selectedCategoria?.nombre, ui_total: total });
      setShowSuccess(true);

      // Resetear formulario después de 10 segundos
      setTimeout(() => {
        setShowSuccess(false);
        setResultado(null);
        setCantidad(1);
        setSelectedCategoriaId(categorias[0]?.id_categoria || '');
        setMetodo('tarjeta_debito');
        router.push('/'); // Redirigir al menú principal
      }, 10000);
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
    setSelectedCategoriaId(categorias[0]?.id_categoria || '');
    setMetodo('tarjeta_debito');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardDni('');
  };

  const descargarComprobantePDF = async () => {
    const { jsPDF } = await import('jspdf');
    const QRCode = await import('qrcode');

    const qrData = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1';

    // Generar QR como dataURL
    const qrDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: { dark: '#000000', light: '#ffffff' },
    });

    // Cargar imagen del evento (fallback si no existe)
    const eventImageUrl = (resultado?.evento?.imagen_url as string) || '/icon-ticketeate.png';
    const imageToDataUrl = async (url: string) => {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(String(reader.result));
          reader.readAsDataURL(blob);
        });
      } catch {
        return '';
      }
    };
    const eventImgDataUrl = await imageToDataUrl(eventImageUrl);

    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.setFont('helvetica', 'normal');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Tarjeta estilo UI
    const cardWidth = Math.min(180, pageWidth - 20);
    const cardHeight = 200;
    const cardX = (pageWidth - cardWidth) / 2;
    const cardY = (pageHeight - cardHeight) / 2;

    // Fondo (verde claro) con borde suave y esquinas redondeadas
    pdf.setFillColor(236, 252, 240);
    pdf.setDrawColor(199, 230, 204);
    // roundedRect está disponible en jsPDF v3
    pdf.roundedRect(cardX, cardY, cardWidth, cardHeight, 4, 4, 'FD');

    // Título
    const title = '¡Compra exitosa!';
    pdf.setTextColor(22, 101, 52);
    pdf.setFontSize(20);
    const titleWidth = pdf.getTextWidth(title);
    let cursorY = cardY + 14;
    pdf.text(title, cardX + (cardWidth - titleWidth) / 2, cursorY, { baseline: 'middle' });

    // Imagen del evento
    if (eventImgDataUrl) {
      const imgMargin = 10;
      const imgW = cardWidth - imgMargin * 2;
      const imgH = 40;
      pdf.addImage(
        eventImgDataUrl,
        'PNG',
        cardX + imgMargin,
        cursorY + 6,
        imgW,
        imgH,
        undefined,
        'FAST',
      );
      cursorY += 6 + imgH;
    }

    // QR centrado
    const qrSize = 50;
    pdf.addImage(
      qrDataUrl,
      'PNG',
      cardX + (cardWidth - qrSize) / 2,
      cursorY + 10,
      qrSize,
      qrSize,
      undefined,
      'FAST',
    );
    cursorY += 10 + qrSize + 6;

    // Contenido
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12.5);
    const left = cardX + 12;
    cursorY += 6;
    pdf.text(`${cantidad} entrada(s) para ${selectedCategoria?.nombre ?? '—'}`, left, cursorY);
    cursorY += 12;
    pdf.text(`Total: ${formatARS(precioUnitario * cantidad)}`, left, cursorY);
    cursorY += 12;
    pdf.text(
      `Método: ${metodo === 'tarjeta_credito' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}`,
      left,
      cursorY,
    );
    cursorY += 12;
    pdf.text(`Reserva: #${resultado?.reserva?.id_reserva ?? '—'}`, left, cursorY);

    const fileName = `comprobante-reserva-${resultado?.reserva?.id_reserva || 'ticket'}.pdf`;
    pdf.save(fileName);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-black">
      {/* Contenedor principal con scroll */}
      <div className="mx-auto max-w-[1200px] space-y-4">
        {/* Header de la página */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {eventoTitulo ? eventoTitulo : 'Comprar Entradas'}
          </h1>
          <p className="text-gray-900">Selecciona tu sector y completa tu compra</p>
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

            {/* Lista de categorías con scroll */}
            <div className="max-h-[300px] flex-1 overflow-y-auto p-2">
              {categoriasLoading && (
                <div className="m-2 text-sm text-gray-500">Cargando categorías...</div>
              )}
              {!categoriasLoading && categorias.length === 0 && (
                <div className="m-2 text-sm text-gray-500">No hay categorías disponibles</div>
              )}
              {!categoriasLoading &&
                categorias.map((cat, idx) => {
                  const activo = cat.id_categoria === selectedCategoriaId;
                  const colores = ['#a5d6a7', '#43a047', '#8bc34a', '#66bb6a'];
                  const color = colores[idx % colores.length];
                  return (
                    <label
                      key={cat.id_categoria}
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
                          style={{ background: color }}
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="font-bold">{cat.nombre}</div>
                        <div className="mt-0.5 text-sm">{formatARS(Number(cat.precio))}</div>
                        <div className="mt-0.5 text-xs">
                          <span className="font-semibold text-green-700">
                            {cat.stock_disponible} disponibles
                          </span>
                        </div>
                      </div>

                      <input
                        type="radio"
                        name="categoria"
                        checked={activo}
                        onChange={() => setSelectedCategoriaId(cat.id_categoria)}
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
                  disabled={showSuccess || !selectedCategoria}
                >
                  {Array.from({ length: maxCantidad }, (_, i) => i + 1).map((n) => (
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
                  <option value="tarjeta_debito">Tarjeta de Débito</option>
                  <option value="tarjeta_credito">Tarjeta de Crédito</option>
                </select>
              </div>

              {/* Datos de tarjeta */}
              {isCardPayment && (
                <div className="mb-3 space-y-3 rounded-xl border border-gray-200 bg-white p-3">
                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-medium text-gray-700">
                      Número de tarjeta
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="#### #### #### ####"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-500 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 flex flex-col">
                      <label className="mb-1 text-xs font-medium text-gray-700">
                        Vencimiento (MM/AA)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        className="rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-500 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1 flex flex-col">
                      <label className="mb-1 text-xs font-medium text-gray-700">CVV</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="3 o 4 dígitos"
                        value={cardCvv}
                        onChange={(e) =>
                          setCardCvv(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))
                        }
                        className="rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-500 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-1 flex flex-col">
                      <label className="mb-1 text-xs font-medium text-gray-700">DNI</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Solo números"
                        value={cardDni}
                        onChange={(e) =>
                          setCardDni(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))
                        }
                        className="rounded-lg border border-gray-300 bg-white text-black placeholder:text-gray-500 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  {!isValidCardInputs() && (
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-800">
                      Verifica número, vencimiento, CVV y DNI.
                    </div>
                  )}
                </div>
              )}

              {/* Info selección */}
              <div className="mb-3 flex items-start justify-between rounded-xl border border-gray-200 bg-white px-3 py-3">
                <div>
                  <div className="text-xs text-gray-500">Sector</div>
                  <div className="font-bold">{selectedCategoria?.nombre ?? '—'}</div>
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

              {/* Temporizador de reserva */}
              <div className="mb-4 flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-3">
                <div className="font-medium text-yellow-800">Reserva temporal</div>
                <div className="font-bold text-yellow-900 tabular-nums">
                  {holdActive ? `Tiempo restante: ${formatTime(holdLeft)}` : 'Tiempo expirado'}
                </div>
              </div>

              {/* Botón de compra */}
              {!showSuccess ? (
                <button
                  onClick={comprar}
                  disabled={
                    loading ||
                    !selectedCategoria ||
                    cantidad < 1 ||
                    (isCardPayment && !isValidCardInputs()) ||
                    !holdActive ||
                    holdLeft === 0
                  }
                  className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading
                    ? 'Comprando...'
                    : isCardPayment && !isValidCardInputs()
                      ? 'Completa los datos de tarjeta'
                      : holdActive
                        ? 'Comprar'
                        : 'Tiempo expirado'}
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
                  <div ref={comprobanteRef}>
                    <div className="mb-2 text-4xl">🎉</div>
                    <h3 className="mb-2 text-lg font-bold text-green-800">¡Compra exitosa!</h3>
                    <div className="space-y-1 text-sm text-green-700">
                      <p>
                        ✅ {cantidad} entrada(s) para {selectedCategoria?.nombre}
                      </p>
                      <p>💰 Total: {formatARS(total)}</p>
                      <p>
                        💳 Método:{' '}
                        {metodo === 'tarjeta_credito' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}
                      </p>
                      <p>🆔 Reserva: #{resultado.reserva?.id_reserva}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-green-600">
                    Se han generado {cantidad} código(s) QR para tu entrada
                  </div>
                  <div className="mt-3 text-xs font-medium text-blue-600">
                    ⏱️ Serás redirigido al menú principal en 10 segundos. Puedes descargar tu
                    comprobante ahora.
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <button
                      onClick={descargarComprobantePDF}
                      className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                    >
                      Descargar comprobante (PDF)
                    </button>
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
