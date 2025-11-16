import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface CreateInviteCodeInput {
  eventoid: string;
  codigo?: string;
  fecha_expiracion?: Date;
  usos_max?: number;
}

interface InviteCode {
  codigoid: string;
  eventoid: string;
  codigo: string;
  estado: string;
  fecha_creacion: Date;
  fecha_expiracion: Date;
  usos_totales: number;
  usos_max: number;
}

interface ValidateInviteCodeResponse {
  valid: boolean;
  codigoid?: string;
  codigo?: string;
  eventoid?: string;
  eventoTitulo?: string;
  eventoDescripcion?: string;
  eventoUbicacion?: string;
  estado?: string;
  usos_totales?: number;
  usos_max?: number;
  fecha_expiracion?: Date;
  error?: string;
}

interface UseInviteCodeResponse {
  success: boolean;
  eventoid?: string;
  colaboradorEventoId?: string;
  error?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to get JWT token
async function getAuthHeaders() {
  try {
    const res = await fetch('/api/auth/token', {
      credentials: 'include',
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to get auth token: ${res.status}`, errorText);
      throw new Error(`Token endpoint returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    if (!data.token) {
      console.error('No token in response:', data);
      throw new Error('No token returned from auth endpoint');
    }

    return {
      Authorization: `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('getAuthHeaders error:', error);
    throw error instanceof Error
      ? error
      : new Error('No se pudo obtener el token JWT. Asegúrate de estar autenticado.');
  }
}

export function useCreateInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInviteCodeInput) => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/events/${data.eventoid}/invite-codes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          codigo: data.codigo,
          fecha_expiracion: data.fecha_expiracion?.toISOString(),
          usos_max: data.usos_max,
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear código de invitación');
      }

      return response.json() as Promise<InviteCode>;
    },
    onMutate: async (newCode) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({
        queryKey: ['inviteCodes', newCode.eventoid],
      });

      // Snapshot previous data
      const previousCodes = queryClient.getQueryData<InviteCode[]>([
        'inviteCodes',
        newCode.eventoid,
      ]);

      // Optimistically update to the new value
      if (previousCodes) {
        const optimisticCode: InviteCode = {
          codigoid: `temp-${Date.now()}`,
          eventoid: newCode.eventoid,
          codigo: newCode.codigo || `CODE-${Math.random().toString(36).substring(7).toUpperCase()}`,
          estado: 'ACTIVO',
          fecha_creacion: new Date(),
          fecha_expiracion:
            newCode.fecha_expiracion || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          usos_totales: 0,
          usos_max: newCode.usos_max || 1,
        };

        queryClient.setQueryData(
          ['inviteCodes', newCode.eventoid],
          [...previousCodes, optimisticCode],
        );
      }

      return { previousCodes };
    },
    onError: (err, newCode, context) => {
      // Revert to previous data on error
      if (context?.previousCodes) {
        queryClient.setQueryData(['inviteCodes', newCode.eventoid], context.previousCodes);
      }
    },
    onSuccess: (_, variables) => {
      // Revalidate the invite codes query for this event
      queryClient.invalidateQueries({
        queryKey: ['inviteCodes', variables.eventoid],
      });
    },
  });
}

export function useGetInviteCodes(eventoid: string) {
  return useQuery({
    queryKey: ['inviteCodes', eventoid],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/events/${eventoid}/invite-codes`, {
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al obtener códigos de invitación');
      }

      const data = await response.json();
      return data.codes as InviteCode[];
    },
    enabled: !!eventoid,
  });
}

export function useDeactivateInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventoid, codigoid }: { eventoid: string; codigoid: string }) => {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE}/events/${eventoid}/invite-codes/${codigoid}/deactivate`,
        {
          method: 'PUT',
          headers,
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al desactivar código de invitación');
      }

      return response.json();
    },
    onMutate: async ({ eventoid, codigoid }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['inviteCodes', eventoid],
      });

      // Snapshot previous data
      const previousCodes = queryClient.getQueryData<InviteCode[]>(['inviteCodes', eventoid]);

      // Optimistically update status
      if (previousCodes) {
        queryClient.setQueryData(
          ['inviteCodes', eventoid],
          previousCodes.map((code) =>
            code.codigoid === codigoid ? { ...code, estado: 'INACTIVO' } : code,
          ),
        );
      }

      return { previousCodes };
    },
    onError: (err, { eventoid }, context) => {
      // Revert to previous data on error
      if (context?.previousCodes) {
        queryClient.setQueryData(['inviteCodes', eventoid], context.previousCodes);
      }
    },
    onSuccess: (_, { eventoid }) => {
      // Revalidate the invite codes query
      queryClient.invalidateQueries({
        queryKey: ['inviteCodes', eventoid],
      });
    },
  });
}

export function useGetColaboradores(eventoid: string) {
  return useQuery({
    queryKey: ['colaboradores', eventoid],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/events/${eventoid}/colaboradores`, {
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al obtener colaboradores');
      }

      const data = await response.json();
      return data.colaboradores;
    },
    enabled: !!eventoid,
  });
}

// Hooks para validar y usar códigos durante el registro
export function useValidateInviteCode() {
  return useMutation({
    mutationFn: async (codigo: string) => {
      const response = await fetch(`${API_BASE}/invite-codes/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Código de invitación no válido');
      }

      return response.json() as Promise<ValidateInviteCodeResponse>;
    },
  });
}

export function useUseInviteCode() {
  return useMutation({
    mutationFn: async (codigo: string) => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/invite-codes/use`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ codigo }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al usar código de invitación');
      }

      return response.json() as Promise<UseInviteCodeResponse>;
    },
  });
}

export function useGetMyEvent() {
  return useQuery({
    queryKey: ['myEvent'],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/invite-codes/my-event`, {
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al obtener evento');
      }

      const data = await response.json();
      return data.eventos;
    },
  });
}
