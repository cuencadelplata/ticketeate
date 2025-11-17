import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Cupon {
  cuponid: string;
  eventoid: string;
  codigo: string;
  porcentaje_descuento: string;
  fecha_creacion: string;
  fecha_expiracion: string;
  limite_usos: number;
  usos_actuales: number;
  estado: string;
  version: number;
  is_active: boolean;
  deleted_at: string | null;
  updated_by: string | null;
}

export interface CreateCuponData {
  eventId: string;
  codigo: string;
  porcentaje_descuento: number;
  fecha_expiracion: string;
  limite_usos: number;
}

export interface UpdateCuponData {
  cuponId: string;
  eventId: string;
  codigo?: string;
  porcentaje_descuento?: number;
  fecha_expiracion?: string;
  limite_usos?: number;
  estado?: string;
}

// Hook para obtener cupones de un evento
export function useCupones(eventId: string) {
  return useQuery({
    queryKey: ['cupones', eventId],
    queryFn: async (): Promise<Cupon[]> => {
      const res = await fetch(`/api/cupones?eventId=${eventId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al obtener cupones');
      const data = await res.json();
      return data.cupones || [];
    },
    enabled: !!eventId,
  });
}

// Hook para crear un cupón con optimistic UI
export function useCreateCupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cuponData: CreateCuponData): Promise<Cupon> => {
      console.log('[useCreateCupon] Datos enviados:', {
        ...cuponData,
        types: {
          eventId: typeof cuponData.eventId,
          codigo: typeof cuponData.codigo,
          porcentaje_descuento: typeof cuponData.porcentaje_descuento,
          fecha_expiracion: typeof cuponData.fecha_expiracion,
          limite_usos: typeof cuponData.limite_usos,
        },
      });

      const res = await fetch('/api/cupones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(cuponData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('[useCreateCupon] Error response:', {
          status: res.status,
          error: errorData,
        });
        throw new Error(errorData.error || 'Error al crear cupón');
      }

      const data = await res.json();
      return data.cupon;
    },
    onMutate: async (newCupon) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: ['cupones', newCupon.eventId] });

      // Guardar snapshot del estado anterior
      const previousCupones = queryClient.getQueryData<Cupon[]>(['cupones', newCupon.eventId]);

      // Optimisticamente agregar el nuevo cupón
      const tempCupon: Cupon = {
        cuponid: `temp-${Date.now()}`,
        eventoid: newCupon.eventId,
        codigo: newCupon.codigo,
        porcentaje_descuento: newCupon.porcentaje_descuento.toString(),
        fecha_creacion: new Date().toISOString(),
        fecha_expiracion: newCupon.fecha_expiracion,
        limite_usos: newCupon.limite_usos,
        usos_actuales: 0,
        estado: 'ACTIVO',
        version: 1,
        is_active: true,
        deleted_at: null,
        updated_by: null,
      };

      queryClient.setQueryData<Cupon[]>(['cupones', newCupon.eventId], (old) => [
        tempCupon,
        ...(old || []),
      ]);

      return { previousCupones };
    },
    onError: (_err, newCupon, context) => {
      // Revertir en caso de error
      if (context?.previousCupones) {
        queryClient.setQueryData(['cupones', newCupon.eventId], context.previousCupones);
      }
    },
    onSettled: (_data, _error, variables) => {
      // Refetch para asegurar sincronización
      queryClient.invalidateQueries({ queryKey: ['cupones', variables.eventId] });
    },
  });
}

// Hook para actualizar un cupón con optimistic UI
export function useUpdateCupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData: UpdateCuponData): Promise<Cupon> => {
      const res = await fetch('/api/cupones', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al actualizar cupón');
      }

      const data = await res.json();
      return data.cupon;
    },
    onMutate: async (updatedCupon) => {
      await queryClient.cancelQueries({ queryKey: ['cupones', updatedCupon.eventId] });

      const previousCupones = queryClient.getQueryData<Cupon[]>(['cupones', updatedCupon.eventId]);

      // Actualizar optimísticamente
      queryClient.setQueryData<Cupon[]>(['cupones', updatedCupon.eventId], (old) =>
        old?.map((cupon) =>
          cupon.cuponid === updatedCupon.cuponId
            ? {
                ...cupon,
                ...(updatedCupon.codigo && { codigo: updatedCupon.codigo }),
                ...(updatedCupon.porcentaje_descuento && {
                  porcentaje_descuento: updatedCupon.porcentaje_descuento.toString(),
                }),
                ...(updatedCupon.fecha_expiracion && {
                  fecha_expiracion: updatedCupon.fecha_expiracion,
                }),
                ...(updatedCupon.limite_usos && { limite_usos: updatedCupon.limite_usos }),
                ...(updatedCupon.estado && { estado: updatedCupon.estado }),
                version: cupon.version + 1,
              }
            : cupon,
        ),
      );

      return { previousCupones };
    },
    onSuccess: (data, updatedCupon) => {
      // Actualizar con los datos reales del servidor desde el historial
      queryClient.setQueryData<Cupon[]>(['cupones', updatedCupon.eventId], (old) =>
        old?.map((cupon) =>
          cupon.cuponid === updatedCupon.cuponId
            ? {
                ...cupon,
                codigo: data.codigo || cupon.codigo,
                porcentaje_descuento:
                  data.porcentaje_descuento?.toString() || cupon.porcentaje_descuento,
                fecha_expiracion: data.fecha_expiracion || cupon.fecha_expiracion,
                limite_usos: data.limite_usos || cupon.limite_usos,
                estado: data.estado || cupon.estado,
                version: data.version || cupon.version,
              }
            : cupon,
        ),
      );
    },
    onError: (_err, updatedCupon, context) => {
      if (context?.previousCupones) {
        queryClient.setQueryData(['cupones', updatedCupon.eventId], context.previousCupones);
      }
    },
    onSettled: (_data, _error, variables) => {
      void _data;
      void _error;
      // Pequeño delay para asegurar sincronización del historial
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['cupones', variables.eventId] });
      }, 100);
    },
  });
}

// Hook para eliminar un cupón con optimistic UI
export function useDeleteCupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cuponId,
      eventId,
    }: {
      cuponId: string;
      eventId: string;
    }): Promise<Cupon> => {
      const res = await fetch(`/api/cupones?cuponId=${cuponId}&eventId=${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al eliminar cupón');
      }

      const data = await res.json();
      return data.cupon;
    },
    onMutate: async ({ cuponId, eventId }) => {
      await queryClient.cancelQueries({ queryKey: ['cupones', eventId] });

      const previousCupones = queryClient.getQueryData<Cupon[]>(['cupones', eventId]);

      // Remover optimísticamente
      queryClient.setQueryData<Cupon[]>(['cupones', eventId], (old) =>
        old?.filter((cupon) => cupon.cuponid !== cuponId),
      );

      return { previousCupones };
    },
    onError: (error, { eventId }, context) => {
      console.error('Error al eliminar cupón:', error);
      if (context?.previousCupones) {
        queryClient.setQueryData(['cupones', eventId], context.previousCupones);
      }
    },
    onSettled: (_data, _error, variables) => {
      void _data;
      void _error;
      // Pequeño delay para asegurar sincronización del historial
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['cupones', variables.eventId] });
      }, 100);
    },
  });
}
