import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
import { fetchWithApiKey } from '@/lib/fetch-api';
import type {
  Event,
  CreateEventData,
  CreateEventResponse,
  GetEventsResponse,
  GetEventResponse,
  GetAllEventsResponse,
  GetPublicEventResponse,
} from '@/types/events';

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

// Hook para obtener eventos (protegido)
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      try {
        console.log('[useEvents] Fetching events from:', API_ENDPOINTS.events);
        const headers = await getAuthHeaders();
        console.log('[useEvents] Got headers:', { hasAuth: !!headers.Authorization });

        const res = await fetchWithApiKey(API_ENDPOINTS.events, {
          headers,
          method: 'GET',
        });

        console.log('[useEvents] Response status:', res.status, res.statusText);

        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Error fetching events: ${res.status} ${res.statusText}`, errorText);
          throw new Error(`Error al obtener eventos: ${res.status}`);
        }

        const data: GetEventsResponse = await res.json();
        console.log('[useEvents] Success! Got', data.events?.length || 0, 'events');
        return data.events || [];
      } catch (error) {
        console.error('useEvents hook error:', error);
        throw error;
      }
    },
    retry: 1,
    // Configuración para asegurar que los cambios se reflejen en la UI
    staleTime: 0, // Los datos son stale inmediatamente (permite refetch rápido)
  });
}

// hook para obtener todos los eventos - pasados y activos
export function useAllEvents() {
  return useQuery({
    queryKey: ['all-events'],
    queryFn: async (): Promise<Event[]> => {
      const res = await fetchWithApiKey(API_ENDPOINTS.allEvents, { credentials: 'include' });
      if (!res.ok) throw new Error('Error al obtener todos los eventos');
      const data: GetAllEventsResponse = await res.json();
      return data.events || [];
    },
    staleTime: 0, // Sin cache, siempre considerados stale para permitir updates rápidos
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}

// Hook público para obtener un evento por id
export function usePublicEvent(id?: string) {
  return useQuery({
    queryKey: ['public-event', id],
    queryFn: async (): Promise<Event> => {
      const res = await fetchWithApiKey(API_ENDPOINTS.publicEventById(id as string), {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al obtener el evento');
      const data: GetPublicEventResponse = await res.json();
      return data.event;
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

// Hook para obtener un evento específico (protegido)
export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async (): Promise<Event> => {
      const headers = await getAuthHeaders();
      const res = await fetchWithApiKey(`${API_ENDPOINTS.events}/${id}`, { headers });
      if (!res.ok) throw new Error('Error al obtener el evento');
      const data: GetEventResponse = await res.json();
      return data.event;
    },
    enabled: !!id,
  });
}

// Hook para crear un evento
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: CreateEventData): Promise<Event> => {
      const headers = await getAuthHeaders();
      const res = await fetchWithApiKey(API_ENDPOINTS.events, {
        method: 'POST',
        headers,
        body: JSON.stringify(eventData),
      });
      if (!res.ok) {
        let msg = 'Error al crear el evento';
        try {
          const err = await res.json();
          msg = err.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const data: CreateEventResponse = await res.json();
      return data.event;
    },
    onSuccess: (newEvent) => {
      // Invalidar todas las queries relacionadas con eventos para asegurar datos frescos
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });

      // También invalidar queries específicas del evento creado
      queryClient.invalidateQueries({ queryKey: ['events', newEvent.eventoid] });

      // Forzar refetch inmediato de las queries principales
      queryClient.refetchQueries({ queryKey: ['events'] });
      queryClient.refetchQueries({ queryKey: ['all-events'] });
    },
    onError: (error) => {
      console.error('Error al crear evento:', error);
    },
  });
}

// Hook para actualizar un evento
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      eventData,
    }: {
      id: string;
      eventData: Partial<CreateEventData>;
    }): Promise<Event> => {
      // Usar la ruta API local en lugar del microservicio
      const res = await fetch(`/api/eventos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
        credentials: 'include',
      });

      if (!res.ok) {
        let msg = 'Error al actualizar el evento';
        try {
          const err = await res.json();
          msg = err.error || msg;
        } catch {}
        throw new Error(msg);
      }
      const data = await res.json();
      return data.event;
    },
    onMutate: async ({ id, eventData }) => {
      console.log('[useUpdateEvent] onMutate - Actualizando caché optimista para evento:', id);

      // Cancelar queries que puedan conflictuar
      await queryClient.cancelQueries({ queryKey: ['events'] });
      await queryClient.cancelQueries({ queryKey: ['all-events'] });
      await queryClient.cancelQueries({ queryKey: ['events', id] });

      // Guardar snapshot anterior por si hay rollback
      const previousEvents = queryClient.getQueryData<Event[]>(['events']);
      const previousAllEvents = queryClient.getQueryData<Event[]>(['all-events']);
      const previousEvent = queryClient.getQueryData<Event>(['events', id]);

      console.log('[useUpdateEvent] Datos anteriores guardados, actualizando caché...');

      // Actualizar caché optimista en la lista de eventos
      queryClient.setQueryData(['events'], (oldData: Event[] | undefined) => {
        if (!oldData) {
          console.log('[useUpdateEvent] No hay datos anteriores en caché');
          return oldData;
        }
        const newData = oldData.map((e) => {
          if (e.eventoid === id) {
            const updated = {
              ...e,
              titulo: eventData.titulo ?? e.titulo,
              descripcion: eventData.descripcion ?? e.descripcion,
              ubicacion: eventData.ubicacion ?? e.ubicacion,
              // Si actualiza estado, también actualizar evento_estado
              ...(eventData.estado
                ? {
                    evento_estado: [
                      {
                        stateventid: `temp-${Date.now()}`,
                        Estado: eventData.estado,
                        fecha_de_cambio: new Date().toISOString(),
                        usuarioid: e.creadorid,
                      },
                    ],
                  }
                : {}),
            };
            console.log(
              '[useUpdateEvent] Evento actualizado optimistamente:',
              updated.eventoid,
              updated,
            );
            return updated;
          }
          return e;
        });
        console.log('[useUpdateEvent] Nueva lista de eventos:', newData.length, 'items');
        return newData;
      });

      queryClient.setQueryData(['all-events'], (oldData: Event[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((e) => {
          if (e.eventoid === id) {
            return {
              ...e,
              titulo: eventData.titulo ?? e.titulo,
              descripcion: eventData.descripcion ?? e.descripcion,
              ubicacion: eventData.ubicacion ?? e.ubicacion,
              ...(eventData.estado
                ? {
                    evento_estado: [
                      {
                        stateventid: `temp-${Date.now()}`,
                        Estado: eventData.estado,
                        fecha_de_cambio: new Date().toISOString(),
                        usuarioid: e.creadorid,
                      },
                    ],
                  }
                : {}),
            };
          }
          return e;
        });
      });

      console.log('[useUpdateEvent] Caché actualizado, retornando snapshot');
      return { previousEvents, previousAllEvents, previousEvent };
    },
    onSuccess: async (updatedEvent) => {
      console.log(
        '[useUpdateEvent] onSuccess - Evento actualizado en servidor:',
        updatedEvent.eventoid,
      );

      // Actualizar con los datos reales del servidor en ambas queries
      console.log('[useUpdateEvent] Actualizando caché con datos del servidor...');

      queryClient.setQueryData(['events', updatedEvent.eventoid], updatedEvent);

      // Actualizar también en las listas para asegurar consistencia
      queryClient.setQueryData(['events'], (oldData: Event[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((e) => (e.eventoid === updatedEvent.eventoid ? updatedEvent : e));
      });

      queryClient.setQueryData(['all-events'], (oldData: Event[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((e) => (e.eventoid === updatedEvent.eventoid ? updatedEvent : e));
      });

      console.log('[useUpdateEvent] Caché actualizado con datos del servidor');

      // Invalidar para refetch de datos frescos (pero NO ESPERAR)
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });

      console.log('[useUpdateEvent] Iniciando refetch en background...');

      // Iniciar refetch en background sin bloquear (NO ESPERAMOS)
      queryClient.refetchQueries({ queryKey: ['events'] });
      queryClient.refetchQueries({ queryKey: ['all-events'] });

      // Revalidar ISR on-demand (no esperamos)
      fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: updatedEvent.eventoid }),
      }).catch((error) => {
        console.error('[useUpdateEvent] Error revalidating ISR:', error);
      });
    },
    onError: async (error, variables, context) => {
      console.error('[useUpdateEvent] Error - Revirtiendo caché:', error);

      // Revertir a datos anteriores en caso de error
      if (context) {
        queryClient.setQueryData(['events'], context.previousEvents);
        queryClient.setQueryData(['all-events'], context.previousAllEvents);
        queryClient.setQueryData(['events', variables.id], context.previousEvent);
      }
    },
  });
}

// Hook para eliminar un evento
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Usar la ruta API local en lugar del microservicio
      const res = await fetch(`/api/eventos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        let msg = 'Error al eliminar el evento';
        try {
          const err = await res.json();
          msg = err.error || msg;
        } catch {}
        throw new Error(msg);
      }
    },
    onMutate: async (deletedId) => {
      console.log('[useDeleteEvent] onMutate - Removiendo evento del caché:', deletedId);

      // Cancelar queries que puedan conflictuar
      await queryClient.cancelQueries({ queryKey: ['events'] });
      await queryClient.cancelQueries({ queryKey: ['all-events'] });

      // Guardar snapshot anterior por si hay rollback
      const previousEvents = queryClient.getQueryData<Event[]>(['events']);
      const previousAllEvents = queryClient.getQueryData<Event[]>(['all-events']);

      console.log('[useDeleteEvent] Datos anteriores guardados, removiendo del caché...');

      // Remover el evento del caché de forma optimista
      queryClient.setQueryData(['events'], (oldData: Event[] | undefined) => {
        if (!oldData) {
          console.log('[useDeleteEvent] No hay datos anteriores en caché');
          return oldData;
        }
        const newData = oldData.filter((e) => e.eventoid !== deletedId);
        console.log(
          '[useDeleteEvent] Evento removido, lista ahora tiene:',
          newData.length,
          'items',
        );
        return newData;
      });

      queryClient.setQueryData(['all-events'], (oldData: Event[] | undefined) => {
        if (!oldData) return oldData;
        const newData = oldData.filter((e) => e.eventoid !== deletedId);
        console.log(
          '[useDeleteEvent] Evento removido de all-events, lista ahora tiene:',
          newData.length,
          'items',
        );
        return newData;
      });

      console.log('[useDeleteEvent] Caché actualizado, retornando snapshot');
      return { previousEvents, previousAllEvents };
    },
    onSuccess: async (_, deletedId) => {
      console.log('[useDeleteEvent] onSuccess - Evento eliminado:', deletedId);

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });
      queryClient.invalidateQueries({ queryKey: ['events', deletedId] });

      console.log(
        '[useDeleteEvent] Evento removido de caché, refetch en background (no bloqueamos)...',
      );

      // Iniciar refetch en background sin bloquear (NO ESPERAMOS)
      queryClient.refetchQueries({ queryKey: ['events'] });
      queryClient.refetchQueries({ queryKey: ['all-events'] });

      // Revalidar ISR on-demand (no esperamos)
      fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: deletedId }),
      }).catch((error) => {
        console.error('[useDeleteEvent] Error revalidating ISR:', error);
      });
    },
    onError: async (error, deletedId, context) => {
      console.error('[useDeleteEvent] Error - Revirtiendo caché:', error);

      // Revertir a datos anteriores en caso de error
      if (context) {
        queryClient.setQueryData(['events'], context.previousEvents);
        queryClient.setQueryData(['all-events'], context.previousAllEvents);
      }
    },
  });
}
