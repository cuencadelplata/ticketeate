import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface FreeEventInscripcion {
  id: string;
  nombre: string;
  correo: string;
  fecha_inscripcion: string;
  codigoQR: string | null;
  validado: boolean;
  fecha_validacion: string | null;
}

interface FreeEventStats {
  totalInscritos: number;
  validados: number;
  pendientes: number;
}

interface FreeEventScannerQuery {
  evento?: string;
  estadisticas: FreeEventStats;
  inscripciones: FreeEventInscripcion[];
}

interface ValidateQrResponse {
  message: string;
  data: {
    validado: boolean;
    fecha_validacion: string | null;
    inscripcion: {
      nombre: string;
    };
  };
}

export function useFreeEventInscripciones(eventoid: string) {
  return useQuery<FreeEventScannerQuery>({
    queryKey: ['free-event-inscripciones', eventoid],
    enabled: !!eventoid,
    queryFn: async () => {
      const response = await fetch(`/api/validar-qr?eventId=${eventoid}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar inscripciones');
      }

      return {
        evento: data.data.evento,
        estadisticas: data.data.estadisticas as FreeEventStats,
        inscripciones: data.data.inscripciones as FreeEventInscripcion[],
      };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useValidateFreeEventQr(eventoid: string) {
  const queryClient = useQueryClient();

  return useMutation<ValidateQrResponse, Error, string>({
    mutationFn: async (codigo: string) => {
      const response = await fetch('/api/validar-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventoid,
          codigo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al validar código');
      }

      return data as ValidateQrResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['free-event-inscripciones', eventoid] });
    },
  });
}
