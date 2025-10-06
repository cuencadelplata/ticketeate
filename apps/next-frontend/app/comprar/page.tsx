'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAllEvents, usePublicEvent } from '@/hooks/use-events';
import { useReservation } from '@/hooks/use-reservation';
import { useQueryClient } from '@tanstack/react-query';
import type { Event } from '@/types/events';
import { ReservationBanner } from '@/components/comprar/ReservationBanner';
import { EventHeader } from '@/components/comprar/EventHeader';
import { SectorList } from '@/components/comprar/SectorList';
import { CheckoutPanel } from '@/components/comprar/CheckoutPanel';
import { SuccessCard } from '@/components/comprar/SuccessCard';

type SectorKey = 'Entrada_General' | 'Entrada_VIP';

const SECTORES: Record<
  SectorKey,
  { nombre: string; precioDesde: number; numerado: boolean; color: string }
> = {
  Entrada_General: {
    nombre: 'General',
    precioDesde: 60000,
    numerado: false,
    color: '#a5d6a7',
  },
  Entrada_VIP: {
    nombre: 'VIP',
    precioDesde: 120000,
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
    if (!selectedEvent?.stock_entrada) return 0;

    const categoria = selectedEvent.stock_entrada.find(
      (cat) => cat.nombre?.toLowerCase() === SECTORES[sectorKey].nombre.toLowerCase(),
    );

    return categoria?.cant_max || 0;
  };

  // Función para seleccionar evento
  const handleEventSelection = (event: Event) => {
    setSelectedEvent(event);
    setShowEventSelection(false);
    router.push(`/comprar?evento=${event.eventoid}`);
  };

  const formatARS = (n: number) =>
    n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  const { precioUnitario, total, feeUnitario } = useMemo(() => {
    const s = SECTORES[sector];
    const fee = Math.round(s.precioDesde * 0.1);
    const unit = s.precioDesde + fee;
    return { precioUnitario: unit, total: unit * cantidad, feeUnitario: fee };
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
      id_evento: selectedEvent.eventoid, // Enviar UUID como string
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
    pdf.text(`Total: ${formatARS((SECTORES[sector].precioDesde + Math.round(SECTORES[sector].precioDesde * 0.1)) * cantidad)}`,
      left,
      cursorY);
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
              const portada = event.imagenes_evento?.find((i) => i.tipo === 'PORTADA' || i.tipo === 'portada')?.url;
              const primera = event.imagenes_evento?.[0]?.url;
              const image = portada || primera || '/icon-ticketeate.png';
              const fecha = event.fechas_evento?.[0]?.fecha_hora
                ? new Date(event.fechas_evento[0].fecha_hora as any)
                : new Date(event.fecha_creacion as any);

              return (
                <div
                  key={event.eventoid}
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

  const reservationActive = isReserved && isReservationActive(eventId || undefined) && timeLeft > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 text-black">
      <ReservationBanner active={reservationActive} timeLeft={timeLeft} formatTimeLeft={formatTimeLeft} />

      <div className={`mx-auto max-w-[1200px] space-y-4 ${reservationActive ? 'pt-20' : 'pt-4'}`}>
        <EventHeader
          event={selectedEvent}
          onBack={() => {
            setSelectedEvent(null);
            setShowEventSelection(true);
            router.push('/comprar');
          }}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_600px]">
          <section className="flex flex-col items-center rounded-2xl bg-white p-4 shadow-md">
            <div className="w-full max-w-[600px]">
              <Image src="/mapa-referencial.png" alt="Mapa referencial de sectores" width={800} height={600} className="w-full rounded-lg border object-contain" />
              <span className="mt-2 block text-center text-sm font-semibold text-gray-600">Mapa referencial</span>
            </div>
          </section>

          <aside className="flex flex-col rounded-2xl bg-white shadow-md">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="font-bold">Seleccionar sector</span>
              <button className="font-semibold text-orange-500 hover:underline" onClick={resetForm}>Limpiar selección</button>
            </div>

            <SectorList sectores={SECTORES} sectorSeleccionado={sector} onSelect={(k) => setSector(k as SectorKey)} getDisponibilidad={(k) => getDisponibilidad(k as SectorKey)} />

            <CheckoutPanel
              cantidad={cantidad}
              setCantidad={setCantidad}
              metodo={metodo}
              setMetodo={setMetodo}
              isCardPayment={isCardPayment}
              cardNumber={cardNumber}
              setCardNumber={(v) => setCardNumber(formatCardNumber(v))}
              cardExpiry={cardExpiry}
              setCardExpiry={(v) => setCardExpiry(formatExpiry(v))}
              cardCvv={cardCvv}
              setCardCvv={(v) => setCardCvv(v.replace(/[^0-9]/g, '').slice(0, 4))}
              cardDni={cardDni}
              setCardDni={(v) => setCardDni(v.replace(/[^0-9]/g, '').slice(0, 10))}
              isValidCardInputs={isValidCardInputs}
              precioUnitario={precioUnitario}
              total={total}
              formatARS={formatARS}
              onReservar={() => startReservation(eventId || '', 300)}
              onComprar={comprar}
              loading={loading}
              showSuccess={showSuccess}
              error={error}
              resetForm={resetForm}
              isReservationActive={!!(isReserved && isReservationActive(eventId || undefined))}
              timeLeft={timeLeft}
            />

            {showSuccess && resultado && (
              <SuccessCard
                cantidad={cantidad}
                total={total}
                sectorNombre={SECTORES[sector].nombre}
                metodo={metodo}
                reservaId={resultado.reserva?.id_reserva}
                onDescargarPDF={descargarComprobantePDF}
                formatARS={formatARS}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
