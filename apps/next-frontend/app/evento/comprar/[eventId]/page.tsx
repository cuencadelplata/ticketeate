'use client';

import { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckoutProvider, useCheckout } from '@/contexts/CheckoutContext';
import { QueueGuard } from '@/components/queue';
import { EventHeader } from '@/components/comprar/EventHeader';
import { MapaVenueImage } from '@/components/comprar/MapaVenueImage';
import { CheckoutHeader } from '@/components/comprar/CheckoutHeader';
import { SectorList } from '@/components/comprar/SectorList';
import { CheckoutPanel } from '@/components/comprar/CheckoutPanel';
import { SuccessCard } from '@/components/comprar/SuccessCard';
import { StripeSuccessMessage } from '@/components/comprar/StripeSuccessMessage';
import { ReservationBannerCheckout } from '@/components/comprar/ReservationBannerCheckout';

function ComprarEventPageContent() {
  const router = useRouter();
  const {
    // State
    selectedEvent,
    eventLoading,
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
    
    // Actions
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
    
    // Flow
    comprar,
    resetForm,
    handleStripeContinue,
    descargarComprobantePDF,
    
    // Reservation
    startReservation,
    isReserved,
    isReservationActive,
    timeLeft,
    eventId,
  } = useCheckout();

  // Loading state
  if (eventLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Cargando evento...</div>
      </div>
    );
  }

  // Not found state
  if (!eventId || !selectedEvent) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Evento no encontrado</div>
          <button
            onClick={() => router.push('/comprar')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Volver a seleccionar evento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 text-black">
      <div className="mx-auto max-w-[1200px] space-y-4 pt-4">
        {/* Reservation Banner */}
        <ReservationBannerCheckout />

        {/* Event Header */}
        <EventHeader
          event={selectedEvent}
          onBack={() => router.push('/comprar')}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_600px]">
          {/* Left: Map */}
          <MapaVenueImage />

          {/* Right: Checkout Panel */}
          <aside className="flex flex-col rounded-2xl bg-white shadow-md">
            {/* Header with actions */}
            <CheckoutHeader />

            {/* Sector Selection */}
            <SectorList
              sectores={sectores}
              sectorSeleccionado={sector}
              onSelect={setSector}
              getDisponibilidad={getDisponibilidad}
              formatPrice={formatPrice}
            />

            {/* Checkout Form */}
            <CheckoutPanel
              cantidad={cantidad}
              setCantidad={setCantidad}
              metodo={metodo as string}
              setMetodo={(m) => setMetodo(m as any)}
              isCardPayment={isCardPayment}
              cardNumber={cardData.number}
              setCardNumber={setCardNumber}
              cardExpiry={cardData.expiry}
              setCardExpiry={setCardExpiry}
              cardCvv={cardData.cvv}
              setCardCvv={setCardCvv}
              cardDni={cardData.dni}
              setCardDni={setCardDni}
              isValidCardInputs={isValidCardInputs}
              precioUnitario={precioUnitario}
              feeUnitario={feeUnitario}
              total={total}
              formatPrice={formatPrice}
              currency={currency}
              onCurrencyChange={setCurrency}
              onReservar={() => startReservation(eventId, 300)}
              onComprar={comprar}
              loading={loading}
              showSuccess={showSuccess}
              error={error}
              resetForm={resetForm}
              isReservationActive={!!(isReserved && isReservationActive(eventId))}
              timeLeft={timeLeft}
            />

            {/* Success Card */}
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

      {/* Stripe Success Message Overlay */}
      {showStripeMessage && <StripeSuccessMessage onContinue={handleStripeContinue} />}
    </div>
  );
}

// Main page component with provider
export default function ComprarEventPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
          <div className="text-white text-xl">Cargando...</div>
        </div>
      }
    >
      <QueueGuard eventId={eventId}>
        <CheckoutProvider eventId={eventId}>
          <ComprarEventPageContent />
        </CheckoutProvider>
      </QueueGuard>
    </Suspense>
  );
}
