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
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
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
    onSuccess: async (updatedEvent) => {
      // Invalidar todas las queries relacionadas con eventos para asegurar datos frescos
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });
      queryClient.invalidateQueries({ queryKey: ['events', updatedEvent.eventoid] });

      // Forzar refetch inmediato de las queries principales
      queryClient.refetchQueries({ queryKey: ['events'] });

      // Revalidar ISR on-demand para esta página específica
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: updatedEvent.eventoid,
            // No enviamos secret desde el cliente por seguridad
          }),
        });
      } catch (error) {
        console.error('Error revalidating ISR:', error);
        // No lanzar error, el cache eventualmente se actualizará
      }
      queryClient.refetchQueries({ queryKey: ['all-events'] });
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
    onSuccess: async (_, deletedId) => {
      // Invalidar todas las queries relacionadas con eventos para asegurar datos frescos
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });
      queryClient.invalidateQueries({ queryKey: ['events', deletedId] });

      // Forzar refetch inmediato de las queries principales
      queryClient.refetchQueries({ queryKey: ['events'] });
      queryClient.refetchQueries({ queryKey: ['all-events'] });

      // Revalidar ISR on-demand (tanto el evento eliminado como la lista)
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: deletedId,
            // No enviamos secret desde el cliente por seguridad
          }),
        });
      } catch (error) {
        console.error('Error revalidating ISR:', error);
      }
    },
  });
}
