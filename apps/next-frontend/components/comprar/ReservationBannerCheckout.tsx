'use client';

import { useCheckout } from '@/contexts/CheckoutContext';

export function ReservationBannerCheckout() {
  const { isReserved, isReservationActive, eventId, timeLeft, formatTimeLeft } = useCheckout();

  if (!isReserved || !isReservationActive(eventId) || timeLeft <= 0) {
    return null;
  }

  return (
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
  );
}
