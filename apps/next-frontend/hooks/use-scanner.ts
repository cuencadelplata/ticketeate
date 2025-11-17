import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Event } from '@/types/events';

interface TicketStats {
  totalTickets: number;
  scannedTickets: number;
  pendingTickets: number;
  percentage: number;
}

interface Ticket {
  entradaid: string;
  codigo_qr: string;
  estado: string;
  reservaid?: string;
  categoria?: string;
  usuario?: {
    name?: string;
    email?: string;
  };
}

interface ScanResult {
  success: boolean;
  entradaid: string;
  codigo_qr: string;
  estado: string;
  message: string;
}

const getApiBase = () => {
  return process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : 'http://localhost:3001/api';
};

export function useGetEventoTickets(eventoid: string) {
  return useQuery({
    queryKey: ['eventoTickets', eventoid],
    queryFn: async () => {
      const response = await fetch(`/api/scanner/tickets?eventoid=${eventoid}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al obtener tickets');
      }

      return response.json();
    },
    enabled: !!eventoid,
  });
}

export function useGetTicketStats(eventoid: string) {
  return useQuery({
    queryKey: ['ticketStats', eventoid],
    queryFn: async (): Promise<TicketStats> => {
      const response = await fetch(`/api/scanner/stats?eventoid=${eventoid}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      const data = await response.json();
      const total = data.total || 0;
      const scanned = data.scanned || 0;
      const percentage = total > 0 ? Math.round((scanned / total) * 100) : 0;

      return {
        totalTickets: total,
        scannedTickets: scanned,
        pendingTickets: total - scanned,
        percentage,
      };
    },
    enabled: !!eventoid,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useScanTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventoid, codigoQr }: { eventoid: string; codigoQr: string }) => {
      const response = await fetch(`/api/scanner/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ eventoid, codigo_qr: codigoQr }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al escanear ticket');
      }

      return response.json() as Promise<ScanResult>;
    },
    onSuccess: (_, variables) => {
      // Invalidar estadísticas y tickets
      queryClient.invalidateQueries({
        queryKey: ['ticketStats', variables.eventoid],
      });
      queryClient.invalidateQueries({
        queryKey: ['eventoTickets', variables.eventoid],
      });
      queryClient.invalidateQueries({
        queryKey: ['scannedTickets', variables.eventoid],
      });
      queryClient.invalidateQueries({
        queryKey: ['unscanedTickets', variables.eventoid],
      });
    },
  });
}

export function useGetScannedTickets(eventoid: string) {
  return useQuery({
    queryKey: ['scannedTickets', eventoid],
    queryFn: async (): Promise<Ticket[]> => {
      const response = await fetch(`/api/scanner/tickets?eventoid=${eventoid}&estado=USADA`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener tickets escaneados');
      }

      const data = await response.json();
      return data.tickets || [];
    },
    enabled: !!eventoid,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useGetUnscanedTickets(eventoid: string) {
  return useQuery({
    queryKey: ['unscanedTickets', eventoid],
    queryFn: async (): Promise<Ticket[]> => {
      const response = await fetch(`/api/scanner/tickets?eventoid=${eventoid}&estado=VALIDA`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al obtener tickets sin escanear');
      }

      const data = await response.json();
      return data.tickets || [];
    },
    enabled: !!eventoid,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useGetEventInfo(eventoid: string) {
  return useQuery({
    queryKey: ['eventInfo', eventoid],
    queryFn: async (): Promise<Event> => {
      const apiBase = getApiBase();
      const response = await fetch(`${apiBase}/events/public/${eventoid}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error al obtener información del evento');
      }

      const data = await response.json();
      return data.event || data;
    },
    enabled: !!eventoid,
  });
}
