'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePublicEvent } from '@/hooks/use-events';
import { useReservation } from '@/hooks/use-reservation';
import { useMockQueue } from '@/hooks/use-mock-queue';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import type { Event } from '@/types/events';

// Types
export type SectorKey = string;

export type UISector = {
  nombre: string;
  precioDesde: number;
  numerado: boolean;
  color: string;
};

export type PaymentMethod = 'tarjeta_credito' | 'tarjeta_debito' | 'mercado_pago' | 'stripe' | string;

export type Currency = 'ARS' | 'USD' | 'EUR';

export interface CardData {
  number: string;
  expiry: string;
  cvv: string;
  dni: string;
}

export interface CheckoutState {
  // Event data
  eventId: string;
  selectedEvent: Event | null;
  
  // Selection
  sector: SectorKey;
  cantidad: number;
  
  // Payment
  metodo: PaymentMethod;
  currency: Currency;
  cardData: CardData;
  
  // UI State
  loading: boolean;
  error: string | null;
  showSuccess: boolean;
  resultado: any;
  
  // Stripe specific
  showStripeMessage: boolean;
}

export interface CheckoutContextValue extends CheckoutState {
  // Event data
  eventLoading: boolean;
  
  // Queue
  canEnter: boolean;
  
  // Reservation
  isReserved: boolean;
  timeLeft: number;
  isReservationActive: (eventId: string) => boolean;
  formatTimeLeft: (seconds: number) => string;
  startReservation: (eventId: string, seconds: number) => void;
  clearReservation: () => void;
  
  // Actions
  setSector: (sector: SectorKey) => void;
  setCantidad: (cantidad: number) => void;
  setMetodo: (metodo: PaymentMethod) => void;
  setCurrency: (currency: Currency) => void;
  setCardNumber: (value: string) => void;
  setCardExpiry: (value: string) => void;
  setCardCvv: (value: string) => void;
  setCardDni: (value: string) => void;
  
  // Computed
  sectores: Record<SectorKey, UISector>;
  getDisponibilidad: (sectorKey: SectorKey) => number;
  precioUnitario: number;
  feeUnitario: number;
  total: number;
  isCardPayment: boolean;
  formatPrice: (amount: number) => string;
  
  // Validation
  isValidCardInputs: () => boolean;
  
  // Purchase flow
  comprar: () => Promise<void>;
  resetForm: () => void;
  cancelPurchase: () => void;
  handleStripeContinue: () => void;
  descargarComprobantePDF: () => Promise<void>;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error('useCheckout must be used within CheckoutProvider');
  }
  return context;
}

// Helper: Generate sectors from event
function buildSectorsFromEvent(event?: Event | null): Record<SectorKey, UISector> {
  const palette = ['#a5d6a7', '#43a047', '#ffb300', '#29b6f6', '#ba68c8', '#ef5350'];
  const map: Record<string, UISector> = {};

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

  const sectorsEn = (event as any)?.mapa_evento?.sectors as Array<any> | undefined;
  const sectorsEs = (event as any)?.mapa_evento?.sectores as Array<any> | undefined;
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

interface CheckoutProviderProps {
  children: ReactNode;
  eventId: string;
}

export function CheckoutProvider({ children, eventId }: CheckoutProviderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Get real user ID from Better-Auth session
  const { data: session } = useSession();
  const idUsuario = session?.user?.id || '';
  
  // Event data
  const { data: eventData, isLoading: eventLoading } = usePublicEvent(eventId);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Queue
  const { canEnter, completePurchase } = useMockQueue(eventId || '', idUsuario);
  
  // Reservation
  const {
    isReserved,
    timeLeft,
    startReservation,
    clearReservation,
    formatTimeLeft,
    isReservationActive,
  } = useReservation();
  
  // Selection state
  const [sector, setSector] = useState<SectorKey>('');
  const [cantidad, setCantidad] = useState<number>(1);
  
  // Payment state
  const [metodo, setMetodo] = useState<PaymentMethod>('tarjeta_debito');
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [cardData, setCardData] = useState<CardData>({
    number: '',
    expiry: '',
    cvv: '',
    dni: '',
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [showStripeMessage, setShowStripeMessage] = useState(false);
  
  // Load event
  useEffect(() => {
    if (eventId && eventData) {
      setSelectedEvent(eventData);
      const dyn = buildSectorsFromEvent(eventData);
      const first = Object.keys(dyn)[0] || '';
      setSector(first);
    }
  }, [eventId, eventData]);
  
  // DISABLED: QueueGuard already handles access verification
  // This useEffect was causing race conditions and premature redirects
  // useEffect(() => {
  //   if (eventId && !canEnter) {
  //     const timer = setTimeout(() => {
  //       if (!canEnter) {
  //         router.push(`/evento/${eventId}`);
  //       }
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [eventId, canEnter, router]);

  // Listen for reservation expiration and redirect
  useEffect(() => {
    const handleReservationExpired = (event: CustomEvent) => {
      const expiredEventId = event.detail?.eventId;
      
      if (expiredEventId === eventId) {
        console.log('[CheckoutContext] Reservation expired, redirecting to event page');
        
        // Limpiar la cola en el backend
        fetch('/api/queue/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId }),
        }).catch(err => console.error('Error leaving queue:', err));
        
        // Redirigir al evento con mensaje (usando setTimeout para evitar setState durante render)
        setTimeout(() => {
          router.push(`/evento/${eventId}?expired=true`);
        }, 0);
      }
    };

    window.addEventListener('reservation-expired', handleReservationExpired as EventListener);
    
    return () => {
      window.removeEventListener('reservation-expired', handleReservationExpired as EventListener);
    };
  }, [eventId, router]);
  
  // Force currency for payment methods
  useEffect(() => {
    if (metodo === 'mercado_pago' && currency !== 'ARS') {
      setCurrency('ARS');
    }
  }, [metodo, currency]);
  
  useEffect(() => {
    if (metodo === 'stripe' && currency !== 'USD') {
      setCurrency('USD');
    }
  }, [metodo, currency]);
  
  // Computed values
  const sectores = buildSectorsFromEvent(selectedEvent);
  
  const getDisponibilidad = (sectorKey: SectorKey): number => {
    if (selectedEvent?.stock_entrada && selectedEvent.stock_entrada.length > 0) {
      const item = (selectedEvent.stock_entrada as any[]).find(
        (s) => String(s.nombre).toLowerCase() === String(sectorKey).toLowerCase(),
      );
      return item?.cant_max || 0;
    }
    
    const sectorsEn = (selectedEvent as any)?.mapa_evento?.sectors as any[] | undefined;
    const sectorsEs = (selectedEvent as any)?.mapa_evento?.sectores as any[] | undefined;
    const mix = sectorsEn || sectorsEs || [];
    const sec = mix.find(
      (s) => String(s?.name || s?.nombre).toLowerCase() === String(sectorKey).toLowerCase(),
    );
    return Number(sec?.capacity ?? sec?.capacidad ?? 0);
  };
  
  // Pricing
  const rates: Record<Currency, number> = { ARS: 1, USD: 1 / 1300, EUR: 1 / 1600 };
  
  const formatPrice = (amount: number) => {
    const value = amount * rates[currency];
    return value.toLocaleString('es-AR', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'ARS' ? 0 : 2,
    });
  };
  
  const s = sector && sectores[sector] ? sectores[sector] : Object.values(sectores)[0];
  const base = s ? s.precioDesde : 0;
  const feeUnitario = Math.round(base * 0.1);
  const precioUnitario = base + feeUnitario;
  const total = precioUnitario * cantidad;
  
  const isCardPayment = metodo === 'tarjeta_credito' || metodo === 'tarjeta_debito';
  
  // Card helpers
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
      sanitizeNumber(cardData.number).length >= 13 && sanitizeNumber(cardData.number).length <= 19;
    const expMatch = cardData.expiry.match(/^\s*(0[1-9]|1[0-2])\/(\d{2})\s*$/);
    const cvvOk = /^\d{3,4}$/.test(cardData.cvv.trim());
    const dniOk = /^\d{7,10}$/.test(cardData.dni.trim());
    return Boolean(numberOk && expMatch && cvvOk && dniOk);
  };
  
  // Card setters with validation
  const setCardNumber = (value: string) => {
    setCardData((prev) => ({ ...prev, number: formatCardNumber(value) }));
  };
  
  const setCardExpiry = (value: string) => {
    setCardData((prev) => ({ ...prev, expiry: formatExpiry(value) }));
  };
  
  const setCardCvv = (value: string) => {
    setCardData((prev) => ({ ...prev, cvv: value.replace(/[^0-9]/g, '').slice(0, 4) }));
  };
  
  const setCardDni = (value: string) => {
    setCardData((prev) => ({ ...prev, dni: value.replace(/[^0-9]/g, '').slice(0, 10) }));
  };
  
  // Stripe continue handler
  const handleStripeContinue = () => {
    setShowStripeMessage(false);
    
    const eventInfo = selectedEvent || eventData;
    if (eventInfo) {
      setSelectedEvent(eventInfo);
      
      if (!sector) {
        const dyn = buildSectorsFromEvent(eventInfo);
        const firstSector = Object.keys(dyn)[0] || 'General';
        setSector(firstSector);
      }
    }
    
    const mockResultado = {
      reserva: {
        reservaid: 'stripe-' + Date.now(),
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
  };
  
  // Purchase function
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
    
    if (!selectedEvent) {
      setError('Por favor selecciona un evento');
      setLoading(false);
      return;
    }
    
    const datosCompra = {
      id_usuario: idUsuario,
      id_evento: selectedEvent.eventoid,
      cantidad,
      metodo_pago: metodo,
      moneda: currency,
      datos_tarjeta: isCardPayment
        ? {
            numero: sanitizeNumber(cardData.number),
            vencimiento: cardData.expiry.trim(),
            cvv: cardData.cvv.trim(),
            dni: cardData.dni.trim(),
          }
        : undefined,
    };
    
    try {
      // Mercado Pago
      if (metodo === 'mercado_pago') {
        const prefRes = await fetch('/api/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `${selectedEvent.titulo} - ${sector || 'General'}`,
            quantity: cantidad,
            unit_price: precioUnitario,
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
        window.location.href = prefData.init_point || prefData.sandbox_init_point;
        return;
      }
      
      // Stripe
      if (metodo === 'stripe') {
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
      
      // Traditional payment
      const res = await fetch('/api/comprar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosCompra),
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await res.text();
        throw new Error(`La API devolvió un error no JSON: ${textResponse}`);
      }
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      
      setResultado({ ...data, ui_sector: sector || 'Sector', ui_total: total });
      setShowSuccess(true);
      
      await completePurchase(true);
      
      queryClient.invalidateQueries({ queryKey: ['public-event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });
      
      if (metodo !== 'stripe') {
        setTimeout(() => {
          setShowSuccess(false);
          setResultado(null);
          setCantidad(1);
          setSector('Entrada_General');
          setMetodo('tarjeta_debito');
          router.push('/');
        }, 10000);
      }
    } catch (e: any) {
      console.error('Error en compra:', e);
      setError(e.message);
      await completePurchase(false);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setShowSuccess(false);
    setResultado(null);
    setError(null);
    setCantidad(1);
    setSector('Entrada_General');
    setMetodo('tarjeta_debito');
    setCardData({ number: '', expiry: '', cvv: '', dni: '' });
    clearReservation();
    router.push('/comprar');
  };
  
  // Cancel purchase
  const cancelPurchase = () => {
    setShowSuccess(false);
    setResultado(null);
    setError(null);
    setCantidad(1);
    setSector('Entrada_General');
    setMetodo('tarjeta_debito');
    setCardData({ number: '', expiry: '', cvv: '', dni: '' });
    clearReservation();
    router.push('/');
  };
  
  // Enviar comprobante por email (async via cola)
  const descargarComprobantePDF = async () => {
    try {
      const reservaId =
        resultado?.reserva?.reservaid || resultado?.reserva?.id_reserva || 'no-reserva';

      // TODO: Obtener email real del usuario autenticado
      const userEmail = 'usuario@example.com'; // Placeholder
      const userName = 'Usuario'; // Placeholder

      const ticketData = {
        reservaId,
        eventTitle: selectedEvent?.titulo || resultado?.evento?.titulo || 'Evento',
        eventLocation: selectedEvent?.ubicacion || resultado?.evento?.ubicacion,
        eventDate: selectedEvent?.fechas_evento?.[0]?.fecha_hora || resultado?.evento?.fecha_hora,
        eventImageUrl: selectedEvent?.imagenes_evento?.[0]?.url || resultado?.evento?.imagen_url || '/icon-ticketeate.png',
        sector: sector || resultado?.ui_sector || 'General',
        cantidad,
        precioUnitario,
        total,
        metodo,
        userEmail,
        userName,
      };

      // Encolar trabajo de generación y envío
      const response = await fetch('/api/tickets/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservaId,
          userId: idUsuario,
          userEmail,
          userName,
          eventId: selectedEvent?.eventoid || eventId,
          ticketData,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al encolar envío de comprobante');
      }

      const data = await response.json();
      console.log('[CheckoutContext] Ticket enqueued:', data.jobId);

      // Mostrar mensaje al usuario
      alert('Tu comprobante será enviado por email en los próximos minutos');
    } catch (error: any) {
      console.error('[CheckoutContext] Error enqueueing ticket:', error);
      alert('Error al procesar el comprobante. Por favor contacta a soporte.');
    }
  };
  
  const value: CheckoutContextValue = {
    // State
    eventId,
    selectedEvent,
    sector,
    cantidad,
    metodo,
    currency,
    cardData,
    loading,
    error,
    showSuccess,
    resultado,
    showStripeMessage,
    
    // Event
    eventLoading,
    
    // Queue
    canEnter,
    
    // Reservation
    isReserved,
    timeLeft,
    isReservationActive,
    formatTimeLeft,
    startReservation,
    clearReservation,
    
    // Setters
    setSector,
    setCantidad,
    setMetodo,
    setCurrency,
    setCardNumber,
    setCardExpiry,
    setCardCvv,
    setCardDni,
    
    // Computed
    sectores,
    getDisponibilidad,
    precioUnitario,
    feeUnitario,
    total,
    isCardPayment,
    formatPrice,
    
    // Validation
    isValidCardInputs,
    
    // Actions
    comprar,
    resetForm,
    cancelPurchase,
    handleStripeContinue,
    descargarComprobantePDF,
  };
  
  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}
