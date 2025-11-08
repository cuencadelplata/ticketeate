import { useMutation } from '@tanstack/react-query';

export interface ValidateCuponData {
  codigo: string;
  eventId: string;
}

export interface ValidatedCupon {
  cuponid: string;
  codigo: string;
  porcentaje_descuento: number;
  fecha_expiracion: string;
  usos_disponibles: number;
}

export interface ValidateCuponResponse {
  valid: boolean;
  cupon: ValidatedCupon;
}

export function useValidateCupon() {
  return useMutation({
    mutationFn: async (data: ValidateCuponData): Promise<ValidateCuponResponse> => {
      const res = await fetch('/api/cupones/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al validar cupón');
      }

      return res.json();
    },
  });
}
