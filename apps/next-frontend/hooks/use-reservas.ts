import { useQuery } from '@tanstack/react-query';

export interface Reserva {
  reservaid: string;
  eventoid: string;
  cantidad: number;
  estado: string;
  fecha_reserva: string;
  evento: {
    eventoid: string;
    titulo: string;
    descripcion: string | null;
    ubicacion: string;
    imagen: string | null;
    fecha: string | null;
    categoria: string | null;
  };
  entrada: {
    nombre: string;
    precio: string;
    moneda: string;
  };
  entradas: Array<{
    entradaid: string;
    codigo_qr: string;
    estado: string;
  }>;
  pago: {
    pagoid: string;
    estado: string;
    monto_total: string;
    moneda: string;
    fecha_pago: string | null;
  } | null;
}

export interface UserReservasResponse {
  reservas: Reserva[];
  total: number;
}

export function useUserReservas() {
  return useQuery({
    queryKey: ['user-reservas'],
    queryFn: async (): Promise<Reserva[]> => {
      const res = await fetch('/api/reservas/user', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('No autorizado');
        }
        throw new Error('Error al obtener las reservas');
      }

      const data: UserReservasResponse = await res.json();
      return data.reservas || [];
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchOnWindowFocus: true,
  });
}
