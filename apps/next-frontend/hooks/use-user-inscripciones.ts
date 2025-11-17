import { useQuery } from '@tanstack/react-query';

export interface Inscription {
  inscripcionid: string;
  eventid: string;
  eventTitle: string;
  eventDescription?: string;
  eventDate?: string;
  eventLocation?: string;
  eventImage?: string | null;
  eventStatus: string;
  nombre: string;
  correo: string;
  qrCode?: string | null;
  qrData?: string | null;
  qrValidated: boolean;
  qrValidationDate?: string | null;
  inscriptionDate: string;
  status: 'validated' | 'pending' | 'cancelled';
  inscriptionStatus: string;
}

export interface InscripcionesResponse {
  inscripciones: Inscription[];
  total: number;
}

/**
 * Hook para obtener todas las inscripciones del usuario actual
 */
export function useUserInscripciones() {
  return useQuery({
    queryKey: ['user-inscripciones'],
    queryFn: async (): Promise<Inscription[]> => {
      try {
        const res = await fetch('/api/user/inscripciones', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('No autenticado');
          }
          const errorText = await res.text();
          console.error(`Error fetching inscripciones: ${res.status}`, errorText);
          throw new Error(`Error al obtener inscripciones: ${res.status}`);
        }

        const data: InscripcionesResponse = await res.json();
        return data.inscripciones || [];
      } catch (error) {
        console.error('useUserInscripciones hook error:', error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
  });
}
