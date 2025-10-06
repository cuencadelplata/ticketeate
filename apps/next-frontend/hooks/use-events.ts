import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
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
      throw new Error('No se pudo obtener el token JWT. Asegúrate de estar autenticado.');
    }

    const data = await res.json();

    if (!data.token) {
      throw new Error('No se pudo obtener el token JWT. Asegúrate de estar autenticado.');
    }

    return {
      Authorization: `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    throw new Error('No se pudo obtener el token JWT. Asegúrate de estar autenticado.');
  }
}

// Hook para obtener eventos (protegido)
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      const headers = await getAuthHeaders();
      const res = await fetch(API_ENDPOINTS.events, {
        headers,
      });
      if (!res.ok) throw new Error('Error al obtener eventos');
      const data: GetEventsResponse = await res.json();
      return data.events || [];
    },
  });
}

// hook para obtener todos los eventos - pasados y activos
export function useAllEvents() {
  return useQuery({
    queryKey: ['all-events'],
    queryFn: async (): Promise<Event[]> => {
      const res = await fetch(API_ENDPOINTS.allEvents, { credentials: 'include' });
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
      const res = await fetch(API_ENDPOINTS.publicEventById(id as string), {
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
      const res = await fetch(`${API_ENDPOINTS.events}/${id}`, { headers });
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
      const res = await fetch(API_ENDPOINTS.events, {
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
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.setQueryData(['events'], (old: Event[] | undefined) =>
        old ? [...old, newEvent] : [newEvent],
      );
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
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_ENDPOINTS.events}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(eventData),
      });
      if (!res.ok) {
        let msg = 'Error al actualizar el evento';
        try {
          const err = await res.json();
          msg = err.error || msg;
        } catch {}
        throw new Error(msg);
      }
      return res.json();
    },
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', updatedEvent.eventoid] });
      queryClient.setQueryData(['events', updatedEvent.eventoid], updatedEvent);
    },
  });
}

// Hook para eliminar un evento
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API_ENDPOINTS.events}/${id}`, {
        method: 'DELETE',
        headers,
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
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.setQueryData(['events'], (old: Event[] | undefined) =>
        old ? old.filter((e) => e.eventoid !== deletedId) : [],
      );
    },
  });
}
