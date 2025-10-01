'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAllEvents, usePublicEvent } from '@/hooks/use-events';
import { useReservation } from '@/hooks/use-reservation';
import { useQueryClient } from '@tanstack/react-query';
import type { Event } from '@/types/events';

type SectorKey = 'Entrada_General' | 'Entrada_VIP';

const SECTORES: Record<
  SectorKey,
  { nombre: string; precioDesde: number; fee?: number; numerado: boolean; color: string }
> = {
  Entrada_General: {
    nombre: 'General',
    precioDesde: 60000,
    fee: 0,
    numerado: false,
    color: '#a5d6a7',
  },
  Entrada_VIP: {
    nombre: 'VIP',
    precioDesde: 120000,
    fee: 0,
    numerado: true,
    color: '#43a047',
  },
};

export default function ComprarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('evento');
  const queryClient = useQueryClient();

  const [idUsuario] = useState<number>(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventSelection, setShowEventSelection] = useState(!eventId);

  const [cantidad, setCantidad] = useState<number>(1);
  const [metodo, setMetodo] = useState<string>('tarjeta_debito');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const comprobanteRef = useRef<HTMLDivElement | null>(null);

  const [sector, setSector] = useState<SectorKey>('Entrada_General');

  // Hook para manejar reserva temporal
  const {
    isReserved,
    timeLeft,
    startReservation,
    clearReservation,
    formatTimeLeft,
    isReservationActive,
  } = useReservation();

  // Hooks para obtener eventos
  const { data: allEvents = [], isLoading: eventsLoading } = useAllEvents();
  const { data: eventData, isLoading: eventLoading } = usePublicEvent(eventId || undefined);

  // Efecto para cargar evento específico
  useEffect(() => {
    if (eventId && eventData) {
      setSelectedEvent(eventData);
      setShowEventSelection(false);
    }
  }, [eventId, eventData]);

  // Campos de tarjeta
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>(''); // MM/AA
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardDni, setCardDni] = useState<string>('');

  // Obtener disponibilidad real de las categorías de entrada
  const getDisponibilidad = (sectorKey: SectorKey): number => {
    if (!selectedEvent?.categorias_entrada) return 0;

    const categoria = selectedEvent.categorias_entrada.find(
      (cat) => cat.nombre?.toLowerCase() === SECTORES[sectorKey].nombre.toLowerCase(),
    );

    return categoria?.stock_disponible || 0;
  };

  // Función para seleccionar evento
  const handleEventSelection = (event: Event) => {
    setSelectedEvent(event);
    setShowEventSelection(false);
    router.push(`/comprar?evento=${event.id_evento}`);
  };

  const formatARS = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  const { precioUnitario, total } = useMemo(() => {
    const s = SECTORES[sector];
    const unit = s.precioDesde + (s.fee || 0);
    return { precioUnitario: unit, total: unit * cantidad };
  }, [sector, cantidad]);

  const isCardPayment = metodo === 'tarjeta_credito' || metodo === 'tarjeta_debito';

  const sanitizeNumber = (v: string) => v.replace(/[^0-9]/g, '');
  const formatCardNumber = (v: string) =>
    sanitizeNumber(v)
      .slice(0, 19)
      .replace(/(\d{4})(?=\d)/g, '$1 ');
  const formatExpiry = (v: string) => {
    const n = sanitizeNumber(v).slice(0, 4);
    if (n.length <= 2) return n;
    return `${n.slice(0, 2)}/${n.slice(2)}`;
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
    console.log('=== INICIANDO COMPRA ===');
    console.log('selectedEvent:', selectedEvent);
    console.log('isReserved:', isReserved);
    console.log('timeLeft:', timeLeft);

    setLoading(true);
    setError(null);
    setResultado(null);
    setShowSuccess(false);

    if (isCardPayment && !isValidCardInputs()) {
      console.log('Error: Datos de tarjeta inválidos');
      setLoading(false);
      setError('Completa correctamente número, vencimiento (MM/AA), CVV y DNI.');
      return;
    }

    if (!selectedEvent) {
      console.log('Error: No hay evento seleccionado');
      setError('Por favor selecciona un evento');
      setLoading(false);
      return;
    }

    if (!isReserved || !isReservationActive(eventId || undefined)) {
      console.log('Error: No hay reserva activa');
      setError('Debes reservar temporalmente antes de comprar');
      setLoading(false);
      return;
    }

    if (timeLeft === 0) {
      console.log('Error: Reserva expirada');
      setError('Tu reserva ha expirado. Por favor reserva nuevamente.');
      setLoading(false);
      return;
    }

    const datosCompra = {
      id_usuario: idUsuario,
      id_evento: selectedEvent.id_evento, // Enviar UUID como string
      cantidad,
      metodo_pago: metodo,
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
      console.log('Content-Type:', res.headers.get('content-type'));

      // Verificar si la respuesta es JSON válido
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await res.text();
        console.error('Respuesta no es JSON:', textResponse);
        throw new Error(`La API devolvió un error no JSON: ${textResponse}`);
      }

      const data = await res.json();
      console.log('Datos recibidos:', data);

      if (!res.ok) throw new Error(data.error || 'Error');

      setResultado({ ...data, ui_sector: SECTORES[sector].nombre, ui_total: total });
      setShowSuccess(true);

      // Invalidar cache para actualizar disponibilidad
      queryClient.invalidateQueries({ queryKey: ['public-event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });

      // Resetear formulario después de 10 segundos
      setTimeout(() => {
        setShowSuccess(false);
        setResultado(null);
        setCantidad(1);
        setSector('Entrada_General');
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
    setSector('Entrada_General');
    setMetodo('tarjeta_debito');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardDni('');
    clearReservation();
    setSelectedEvent(null);
    setShowEventSelection(true);
    router.push('/comprar');
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
    pdf.text(`${cantidad} entrada(s) para ${SECTORES[sector].nombre}`, left, cursorY);
    cursorY += 12;
    pdf.text(
      `Total: ${formatARS((SECTORES[sector].precioDesde + (SECTORES[sector].fee || 0)) * cantidad)}`,
      left,
      cursorY,
    );
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

  // Si está cargando eventos, mostrar loading
  if (eventsLoading || eventLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Cargando eventos...</div>
      </div>
    );
  }

  // Si no hay evento seleccionado, mostrar selección de eventos
  if (showEventSelection || !selectedEvent) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-4">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Seleccionar Evento</h1>
            <p className="text-gray-300">Elige el evento para el cual deseas comprar entradas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map((event) => {
              const portada = event.imagenes_evento?.find((i) => i.tipo === 'portada')?.url;
              const primera = event.imagenes_evento?.[0]?.url;
              const image = portada || primera || '/icon-ticketeate.png';
              const fecha = event.fechas_evento?.[0]?.fecha_hora
                ? new Date(event.fechas_evento[0].fecha_hora)
                : new Date(event.fecha_inicio_venta);

              return (
                <div
                  key={event.id_evento}
                  onClick={() => handleEventSelection(event)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48">
                    <Image src={image} alt={event.titulo} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{event.titulo}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {event.descripcion || 'Sin descripción'}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{fecha.toLocaleDateString('es-AR')}</span>
                      <span>{event.ubicacion || 'Ubicación por confirmar'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 text-black">
      {/* Banner de reserva temporal */}
      {isReserved && isReservationActive(eventId || undefined) && timeLeft > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-100 to-orange-100 border-b-2 border-yellow-400 shadow-lg">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="font-bold text-yellow-800 text-lg">Reserva temporal activa</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-yellow-800 text-lg">
                Tiempo restante: {formatTimeLeft(timeLeft)}
              </span>
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{Math.floor(timeLeft / 60)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenedor principal con scroll */}
      <div
        className={`mx-auto max-w-[1200px] space-y-4 ${isReserved && isReservationActive(eventId || undefined) && timeLeft > 0 ? 'pt-20' : 'pt-4'}`}
      >
        {/* Header del evento seleccionado */}
        <div className="text-center bg-white rounded-xl p-6 shadow-lg">
          <button
            onClick={() => {
              setSelectedEvent(null);
              setShowEventSelection(true);
              router.push('/comprar');
            }}
            className="mb-4 text-blue-600 hover:text-blue-500 text-sm underline"
          >
            ← Volver a seleccionar evento
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedEvent.titulo}</h1>
          <p className="text-xl text-gray-600 mb-1">
            {selectedEvent.fechas_evento?.[0]?.fecha_hora
              ? new Date(selectedEvent.fechas_evento[0].fecha_hora).toLocaleDateString('es-AR') +
                ' · ' +
                new Date(selectedEvent.fechas_evento[0].fecha_hora).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : new Date(selectedEvent.fecha_inicio_venta).toLocaleDateString('es-AR')}
          </p>
          <p className="text-gray-500 text-sm">Selecciona tu sector y completa tu compra</p>
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
            <div className="max-h-[300px] flex-1 overflow-y-auto p-4">
              {(Object.keys(SECTORES) as SectorKey[]).map((key) => {
                const s = SECTORES[key];
                const activo = key === sector;
                return (
                  <label
                    key={key}
                    className={[
                      'mb-3 grid cursor-pointer items-center gap-3 rounded-xl border bg-white p-4',
                      '[grid-template-columns:24px_1fr_auto]',
                      activo ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-center">
                      <span
                        className="inline-block h-4 w-4 rounded border border-black/10"
                        style={{ background: s.color }}
                      />
                    </div>

                    <div className="flex flex-col">
                      <div className="font-bold text-lg">{s.nombre}</div>
                      <div className="mt-1 text-lg font-semibold">
                        $ {s.precioDesde.toLocaleString('es-AR')}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-green-700">
                        {getDisponibilidad(key)} disponibles
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="sector"
                      checked={activo}
                      onChange={() => setSector(key)}
                      className="h-5 w-5 text-red-500"
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
                      className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Botón de reserva temporal o compra */}
              {!showSuccess ? (
                <div className="space-y-2">
                  {!isReserved || !isReservationActive(eventId || undefined) ? (
                    <button
                      onClick={() => startReservation(eventId || '', 300)}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-orange-600 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-700"
                    >
                      Reservar temporalmente
                    </button>
                  ) : (
                    <button
                      onClick={comprar}
                      disabled={
                        loading || (isCardPayment && !isValidCardInputs()) || timeLeft === 0
                      }
                      className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                    >
                      {loading
                        ? 'Comprando...'
                        : isCardPayment && !isValidCardInputs()
                          ? 'Completa los datos de tarjeta'
                          : timeLeft === 0
                            ? 'Reserva expirada'
                            : 'Comprar'}
                    </button>
                  )}
                </div>
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
                        ✅ {cantidad} entrada(s) para {SECTORES[sector].nombre}
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
