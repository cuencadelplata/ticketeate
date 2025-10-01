import { useState, useEffect } from 'react';

interface ReservationData {
  eventId: string;
  startTime: number;
  duration: number; // en segundos
  isActive: boolean;
}

const RESERVATION_KEY = 'ticketeate_reservation';

export function useReservation() {
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Cargar reserva existente al montar el componente
  useEffect(() => {
    const savedReservation = localStorage.getItem(RESERVATION_KEY);
    if (savedReservation) {
      try {
        const parsed: ReservationData = JSON.parse(savedReservation);
        const now = Date.now();
        const elapsed = Math.floor((now - parsed.startTime) / 1000);
        const remaining = Math.max(0, parsed.duration - elapsed);

        if (remaining > 0) {
          setReservation(parsed);
          setTimeLeft(remaining);
        } else {
          // Reserva expirada, limpiar
          localStorage.removeItem(RESERVATION_KEY);
          setReservation(null);
          setTimeLeft(0);
        }
      } catch (error) {
        console.error('Error parsing reservation data:', error);
        localStorage.removeItem(RESERVATION_KEY);
      }
    }
  }, []);

  // Timer para actualizar el tiempo restante
  useEffect(() => {
    if (!reservation || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Reserva expirada
          localStorage.removeItem(RESERVATION_KEY);
          setReservation(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation, timeLeft]);

  const startReservation = (eventId: string, duration: number = 300) => {
    const reservationData: ReservationData = {
      eventId,
      startTime: Date.now(),
      duration,
      isActive: true,
    };

    localStorage.setItem(RESERVATION_KEY, JSON.stringify(reservationData));
    setReservation(reservationData);
    setTimeLeft(duration);
  };

  const clearReservation = () => {
    localStorage.removeItem(RESERVATION_KEY);
    setReservation(null);
    setTimeLeft(0);
  };

  const isReservationActive = (eventId?: string) => {
    if (!reservation || timeLeft <= 0) return false;
    if (eventId && reservation.eventId !== eventId) return false;
    return true;
  };

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    reservation,
    timeLeft,
    isReserved: isReservationActive(),
    startReservation,
    clearReservation,
    isReservationActive,
    formatTimeLeft,
  };
}
