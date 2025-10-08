'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAllEvents, usePublicEvent } from '@/hooks/use-events';
import { useReservation } from '@/hooks/use-reservation';
import { useQueryClient } from '@tanstack/react-query';
import type { Event } from '@/types/events';
// import { ReservationBanner } from '@/components/comprar/ReservationBanner';
import { EventHeader } from '@/components/comprar/EventHeader';
import { SectorList } from '@/components/comprar/SectorList';
import { CheckoutPanel } from '@/components/comprar/CheckoutPanel';
import { SuccessCard } from '@/components/comprar/SuccessCard';
import { StripeSuccessMessage } from '@/components/comprar/StripeSuccessMessage';
import { useMockQueue } from '@/hooks/use-mock-queue';

type SectorKey = string;

type UISector = { nombre: string; precioDesde: number; numerado: boolean; color: string };

// Genera los sectores dinámicamente desde stock_entrada
function buildSectorsFromEvent(event?: Event | null): Record<SectorKey, UISector> {
  const palette = ['#a5d6a7', '#43a047', '#ffb300', '#29b6f6', '#ba68c8', '#ef5350'];
  const map: Record<string, UISector> = {};

  // 1) Preferir stocks reales
  if (event?.stock_entrada && event.stock_entrada.length > 0) {
    event.stock_entrada.forEach((s: any, idx: number) => {
      const key = String(s.nombre || `Sector ${idx + 1}`);
      map[key] = {
        nombre: key,
        precioDesde: Number(s.precio || 0),
        numerado: false,
        color: palette[idx % palette.length],
      };
    });
    return map;
  }

  // 2) Fallback a mapa_evento.sectors/sectores si no hay stocks en la DB
  const sectorsEn = (event as any)?.mapa_evento?.sectors as
    | Array<{ name?: string; price?: number; capacity?: number; color?: string }>
    | undefined;
  const sectorsEs = (event as any)?.mapa_evento?.sectores as
    | Array<{ nombre?: string; precio?: number; capacidad?: number; color?: string }>
    | undefined;
  const sectors = sectorsEn || sectorsEs;
  if (sectors && sectors.length > 0) {
    sectors.forEach((s: any, idx: number) => {
      const key = String(s?.name || s?.nombre || `Sector ${idx + 1}`);
      map[key] = {
        nombre: key,
        precioDesde: Number(s?.price ?? s?.precio ?? 0),
        numerado: false,
        color: s?.color || palette[idx % palette.length],
      };
    });
  }
  return map;
}

export default function ComprarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('evento');
  const stripeStatus = searchParams.get('stripe_status');
  const queryClient = useQueryClient();

  const [idUsuario] = useState<number>(1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventSelection, setShowEventSelection] = useState(!eventId);

  // Hook para manejar cola (usando mock para consistencia)
  const { canEnter, completePurchase } = useMockQueue(eventId || '', idUsuario.toString());

  // Debug: verificar el eventId
  useEffect(() => {
    console.log('ComprarPage - eventId:', eventId);
    console.log('ComprarPage - canEnter:', canEnter);
  }, [eventId, canEnter]);

  const [cantidad, setCantidad] = useState<number>(1);
  const [metodo, setMetodo] = useState<string>('tarjeta_debito');
  const [currency, setCurrency] = useState<'ARS' | 'USD' | 'EUR'>('ARS');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showStripeMessage, setShowStripeMessage] = useState(false);

  const [sector, setSector] = useState<SectorKey>('');

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
      // set default sector
      const dyn = buildSectorsFromEvent(eventData);
      const first = Object.keys(dyn)[0] || '';
      setSector(first);
    }
  }, [eventId, eventData]);

  // Verificar si el usuario puede comprar (está en cola y es su turno)
  useEffect(() => {
    if (eventId && !canEnter) {
      // Solo redirigir si realmente no puede entrar (no en el primer render)
      // Esto evita redirecciones inmediatas cuando el hook aún se está inicializando
      const timer = setTimeout(() => {
        if (!canEnter) {
          router.push(`/evento/${eventId}`);
        }
      }, 1000); // Esperar 1 segundo antes de verificar

      return () => clearTimeout(timer);
    }
  }, [eventId, canEnter, router]);

  // Campos de tarjeta
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>(''); // MM/AA
  const [cardCvv, setCardCvv] = useState<string>('');
  const [cardDni, setCardDni] = useState<string>('');

  // Obtener disponibilidad real de las categorías de entrada
  const getDisponibilidad = (sectorKey: SectorKey): number => {
    // Preferir stock_entrada
    if (selectedEvent?.stock_entrada && selectedEvent.stock_entrada.length > 0) {
      const item = (selectedEvent.stock_entrada as any[]).find(
        (s) => String(s.nombre).toLowerCase() === String(sectorKey).toLowerCase(),
      );
      return item?.cant_max || 0;
    }
    // Si no hay stocks, intentar capacity/capacidad del mapa_evento
    const sectorsEn = (selectedEvent as any)?.mapa_evento?.sectors as any[] | undefined;
    const sectorsEs = (selectedEvent as any)?.mapa_evento?.sectores as any[] | undefined;
    const mix = sectorsEn || sectorsEs || [];
    const sec = mix.find(
      (s) => String(s?.name || s?.nombre).toLowerCase() === String(sectorKey).toLowerCase(),
    );
    return Number(sec?.capacity ?? sec?.capacidad ?? 0);
  };

  // Función para seleccionar evento
  const handleEventSelection = (event: Event) => {
    setSelectedEvent(event);
    setShowEventSelection(false);
    router.push(`/comprar?evento=${event.eventoid}`);
  };

  // Simple FX mock: ARS base; ajustar si tenés API de tipo de cambio
  // Cotizaciones: 1 USD = 1300 ARS, 1 EUR = 1600 ARS (ARS es base)
  const rates: Record<'ARS' | 'USD' | 'EUR', number> = { ARS: 1, USD: 1 / 1300, EUR: 1 / 1600 };
  const formatPrice = (n: number) => {
    const value = n * rates[currency];
    return value.toLocaleString('es-AR', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'ARS' ? 0 : 2,
    });
  };

  const { precioUnitario, total, feeUnitario } = useMemo(() => {
    const dyn = buildSectorsFromEvent(selectedEvent);
    const s = sector && dyn[sector] ? dyn[sector] : Object.values(dyn)[0];
    const base = s ? s.precioDesde : 0;
    const fee = Math.round(base * 0.1);
    const unit = base + fee;
    return { precioUnitario: unit, total: unit * cantidad, feeUnitario: fee };
  }, [sector, cantidad, selectedEvent]);

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

  // Si se elige Mercado Pago, forzar ARS
  useEffect(() => {
    if (metodo === 'mercado_pago' && currency !== 'ARS') {
      setCurrency('ARS');
    }
  }, [metodo]);

  useEffect(() => {
    if (metodo === 'stripe' && currency !== 'USD') {
      setCurrency('USD');
    }
  }, [metodo]);

  // Manejar éxito/cancelación de Stripe
  useEffect(() => {
    if (stripeStatus === 'success') {
      // Asegurar que tenemos un evento seleccionado cuando viene de Stripe
      if (eventId && !selectedEvent && eventData) {
        setSelectedEvent(eventData);
        setShowEventSelection(false);
      }

      // Mostrar mensaje inicial de Stripe
      setShowStripeMessage(true);
      setMetodo('stripe');

      // Limpiar solo el parámetro stripe_status de la URL, mantener el evento
      const url = new URL(window.location.href);
      url.searchParams.delete('stripe_status');
      window.history.replaceState({}, '', url.toString());
    } else if (stripeStatus === 'cancel') {
      // Mostrar mensaje de cancelación
      setError('El pago fue cancelado. Puedes intentar nuevamente.');

      // Limpiar solo el parámetro stripe_status de la URL, mantener el evento
      const url = new URL(window.location.href);
      url.searchParams.delete('stripe_status');
      window.history.replaceState({}, '', url.toString());

      // Limpiar error después de unos segundos
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, [stripeStatus, router, eventId, selectedEvent, eventData]);

  // Función para continuar después del mensaje de Stripe
  const handleStripeContinue = () => {
    setShowStripeMessage(false);

    // Asegurar que el evento esté seleccionado y la interfaz configurada correctamente
    const eventInfo = selectedEvent || eventData;
    if (eventInfo) {
      setSelectedEvent(eventInfo);
      setShowEventSelection(false);

      // Configurar sector por defecto si no hay uno seleccionado
      if (!sector) {
        const dyn = buildSectorsFromEvent(eventInfo);
        const firstSector = Object.keys(dyn)[0] || 'General';
        setSector(firstSector);
      }
    }

    // Crear resultado simulado para mostrar la tarjeta de éxito
    const mockResultado = {
      reserva: {
        reservaid: 'stripe-' + Date.now(), // Usar reservaid como en la API real
        cantidad: cantidad,
        estado: 'CONFIRMADA',
      },
      pago: {
        metodo_pago: 'stripe',
        estado: 'COMPLETADO',
        monto_total: total,
      },
      evento: eventInfo
        ? {
            titulo: eventInfo.titulo,
            imagen_url: eventInfo.imagenes_evento?.[0]?.url || '/icon-ticketeate.png',
            ubicacion: eventInfo.ubicacion,
            fecha_hora: eventInfo.fechas_evento?.[0]?.fecha_hora,
          }
        : {
            titulo: 'Evento',
            imagen_url: '/icon-ticketeate.png',
            ubicacion: 'Ubicación',
          },
      entradas: Array.from({ length: cantidad }, (_, i) => ({
        id_entrada: `stripe-entrada-${i + 1}`,
        codigo_qr: `stripe-qr-${Date.now()}-${i}`,
        estado: 'VALIDA',
      })),
      resumen: {
        estado: 'Compra procesada exitosamente con Stripe',
        total_entradas: cantidad,
        precio_unitario: (total / cantidad).toFixed(2),
        monto_total: total.toFixed(2),
        metodo_pago: 'stripe',
      },
      ui_sector: sector || 'General',
      ui_total: total,
    };
    setResultado(mockResultado);
    setShowSuccess(true);

    console.log('Stripe continue - evento configurado:', eventInfo?.titulo);
    console.log('Stripe continue - sector:', sector);
  };

  const comprar = async () => {
    console.log('=== INICIANDO COMPRA ===');
    console.log('selectedEvent:', selectedEvent);

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

    const datosCompra = {
      id_usuario: idUsuario,
      id_evento: selectedEvent.eventoid, // Enviar UUID como string
      cantidad,
      metodo_pago: metodo,
      moneda: currency,
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
      // Si es Mercado Pago, primero crear preferencia y redirigir a Checkout Pro
      if (metodo === 'mercado_pago') {
        const prefRes = await fetch('/api/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${selectedEvent.titulo} - ${sector || 'General'}`,
            quantity: cantidad,
            unit_price: precioUnitario, // ya incluye tarifa
            currency: 'ARS',
            metadata: {
              eventoid: selectedEvent.eventoid,
              usuarioid: idUsuario,
              cantidad,
              sector,
            },
          }),
        });
        const prefData = await prefRes.json();
        if (!prefRes.ok) throw new Error(prefData?.error || 'No se pudo crear preferencia de pago');
        // Redirigir a MP
        window.location.href = prefData.init_point || prefData.sandbox_init_point;
        return;
      }

      // Si es Stripe, crear sesión de Checkout y redirigir
      if (metodo === 'stripe') {
        // Convertir desde ARS a USD (1 USD = 1300 ARS)
        const unitUsd = Number((precioUnitario * (1 / 1300)).toFixed(2));
        const stripeRes = await fetch('/api/stripe/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${selectedEvent.titulo} - ${sector || 'General'}`,
            quantity: cantidad,
            unit_price: unitUsd,
            currency: 'USD',
            metadata: {
              eventoid: selectedEvent.eventoid,
              usuarioid: idUsuario,
              cantidad,
              sector,
            },
          }),
        });
        const stripeData = await stripeRes.json();
        if (!stripeRes.ok)
          throw new Error(stripeData?.error || 'No se pudo crear sesión de Stripe');
        window.location.href = stripeData.url;
        return;
      }

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

      setResultado({ ...data, ui_sector: sector || 'Sector', ui_total: total });
      setShowSuccess(true);

      // Finalizar compra en la cola
      await completePurchase(true);

      // Invalidar cache para actualizar disponibilidad
      queryClient.invalidateQueries({ queryKey: ['public-event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });

      // Solo redirigir automáticamente para métodos de pago tradicionales, no para Stripe
      if (metodo !== 'stripe') {
        setTimeout(() => {
          setShowSuccess(false);
          setResultado(null);
          setCantidad(1);
          setSector('Entrada_General');
          setMetodo('tarjeta_debito');
          router.push('/'); // Redirigir al menú principal
        }, 10000);
      }
    } catch (e: any) {
      console.error('Error en compra:', e);
      setError(e.message);

      // Finalizar compra como fallida en la cola
      await completePurchase(false);
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

  const cancelPurchase = () => {
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
    router.push('/');
  };

  const descargarComprobantePDF = async () => {
    console.log('🎫 GENERANDO PDF - Datos disponibles:');
    console.log('- resultado:', resultado);
    console.log('- resultado.reserva:', resultado?.reserva);
    console.log('- metodo:', metodo);
    console.log('- cantidad:', cantidad);
    console.log('- total:', total);

    const { jsPDF } = await import('jspdf');
    const QRCode = await import('qrcode');

    // Usar el ID de reserva real para el QR (usar reservaid que es el campo correcto)
    const reservaId =
      resultado?.reserva?.reservaid || resultado?.reserva?.id_reserva || 'no-reserva';
    console.log('🆔 ID de reserva detectado:', reservaId);

    const qrData = `https://ticketeate.com/entrada/${reservaId}`;
    console.log('🔗 QR Data:', qrData);

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
    pdf.text(`${cantidad} entrada(s) para ${sector || 'Sector'}`, left, cursorY);
    cursorY += 12;
    pdf.text(
      `Total: ${formatPrice((feeUnitario + (precioUnitario - feeUnitario)) * cantidad)}`,
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
    pdf.text(`Reserva: #${reservaId}`, left, cursorY);

    const fileName = `comprobante-reserva-${reservaId}.pdf`;
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
              const portada = event.imagenes_evento?.find(
                (i) => i.tipo === 'PORTADA' || i.tipo === 'portada',
              )?.url;
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 text-black">
      <div className={`mx-auto max-w-[1200px] space-y-4 pt-4`}>
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
              <div className="relative w-full overflow-hidden rounded-lg border group">
                <Image
                  src="/raw.png"
                  alt="Mapa de sectores"
                  width={800}
                  height={600}
                  className="w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <span className="mt-2 block text-center text-sm font-semibold text-gray-600">
                Mapa de sectores
              </span>
            </div>
          </section>

          <aside className="flex flex-col rounded-2xl bg-white shadow-md">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="font-bold">Seleccionar sector</span>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md px-3 py-1 text-sm font-semibold text-white bg-red-600 hover:bg-red-700"
                  onClick={cancelPurchase}
                >
                  Cancelar
                </button>
                <button
                  className="font-semibold text-orange-500 hover:underline"
                  onClick={resetForm}
                >
                  Limpiar selección
                </button>
              </div>
            </div>

            <SectorList
              sectores={buildSectorsFromEvent(selectedEvent) as any}
              sectorSeleccionado={sector}
              onSelect={(k) => setSector(k as SectorKey)}
              getDisponibilidad={(k) => getDisponibilidad(k as SectorKey)}
              formatPrice={formatPrice}
            />

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
              feeUnitario={feeUnitario}
              total={total}
              formatPrice={formatPrice}
              currency={currency}
              onCurrencyChange={(c) => setCurrency(c)}
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
                sectorNombre={sector || 'Sector'}
                metodo={metodo}
                reservaId={resultado.reserva?.reservaid || resultado.reserva?.id_reserva}
                onDescargarPDF={descargarComprobantePDF}
                onVolverAlMenu={() => router.push('/')}
                formatARS={formatPrice}
              />
            )}
          </aside>
        </div>
      </div>

      {/* Mensaje de éxito de Stripe */}
      {showStripeMessage && <StripeSuccessMessage onContinue={handleStripeContinue} />}
    </div>
  );
}
