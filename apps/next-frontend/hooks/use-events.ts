import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
import { useAuth } from '@clerk/nextjs';
import type {
  Event,
  CreateEventData,
  CreateEventResponse,
  GetEventsResponse,
  GetEventResponse,
  GetAllEventsResponse,
  GetPublicEventResponse,
} from '@/types/events';

// Hook para obtener eventos
export function useEvents() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      const token = await getToken();
      let response = await fetch(API_ENDPOINTS.events, {
        headers: {
          Authorization: `Bearer ${token ?? ''}`,
        },
      });
      // Limitar reintento a solo una vez
      if (response.status === 401) {
        const newToken = await getToken();
        response = await fetch(API_ENDPOINTS.events, {
          headers: { Authorization: `Bearer ${newToken ?? ''}` },
        });
        if (response.status === 401) {
          throw new Error('Token inválido. Por favor, inicia sesión nuevamente.');
        }
      }
      if (!response.ok) {
        throw new Error('Error al obtener eventos');
      }
      const data: GetEventsResponse = await response.json();
      if (!data || !Array.isArray(data.events)) {
        throw new Error('Respuesta inesperada del servidor');
      }
      return data.events;
    },
  });
}

// hook para obtener todos los eventos - psados y activos
export function useAllEvents() {
  return useQuery({
    queryKey: ['all-events'],
    queryFn: async (): Promise<Event[]> => {
      const response = await fetch(API_ENDPOINTS.allEvents);
      if (!response.ok) {
        throw new Error('Error al obtener todos los eventos');
      }
      const data: GetAllEventsResponse = await response.json();
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
      const response = await fetch(API_ENDPOINTS.publicEventById(id as string));
      if (!response.ok) {
        throw new Error('Error al obtener el evento');
      }
      const data: GetPublicEventResponse = await response.json();
      return data.event;
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

// Hook para obtener un evento específico
export function useEvent(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['events', id],
    queryFn: async (): Promise<Event> => {
      const token = await getToken();
      let response = await fetch(`${API_ENDPOINTS.events}/${id}`, {
        headers: {
          Authorization: `Bearer ${token ?? ''}`,
        },
      });
      if (response.status === 401) {
        const newToken = await getToken();
        response = await fetch(`${API_ENDPOINTS.events}/${id}`, {
          headers: { Authorization: `Bearer ${newToken ?? ''}` },
        });
      }
      if (!response.ok) {
        throw new Error('Error al obtener el evento');
      }
      const data: GetEventResponse = await response.json();
      return data.event;
    },
    enabled: !!id,
  });
}

// Hook para crear un evento
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (eventData: CreateEventData): Promise<Event> => {
      const token = await getToken();
      let response = await fetch(API_ENDPOINTS.events, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify(eventData),
      });
      if (response.status === 401) {
        const newToken = await getToken();
        response = await fetch(API_ENDPOINTS.events, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken ?? ''}`,
          },
          body: JSON.stringify(eventData),
        });
        if (response.status === 401) {
          throw new Error('Token inválido. Por favor, inicia sesión nuevamente.');
        }
      }
      if (!response.ok) {
        let errorMsg = 'Error al crear el evento';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch {
          // Si el backend no responde con JSON válido
        }
        throw new Error(errorMsg);
      }

      const data: CreateEventResponse = await response.json();
      if (!data || !data.event) {
        throw new Error('Respuesta inesperada del servidor');
      }
      return data.event;
    },
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] }); // Invalida también la lista global

      queryClient.setQueryData(['events'], (oldEvents: Event[] | undefined) => {
        if (oldEvents) {
          return [...oldEvents, newEvent];
        }
        return [newEvent];
      });
    },
    onError: (error) => {
      console.error('Error al crear evento:', error);
    },
  });
}

// Hook para actualizar un evento
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      eventData,
    }: {
      id: string;
      eventData: Partial<CreateEventData>;
    }): Promise<Event> => {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.events}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        let errorMsg = 'Error al actualizar el evento';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (!data || !data.event) {
        throw new Error('Respuesta inesperada del servidor');
      }
      return data.event as Event;
    },
    onSuccess: (updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });
      queryClient.invalidateQueries({ queryKey: ['events', updatedEvent.id_evento] });

      queryClient.setQueryData(['events', updatedEvent.id_evento], updatedEvent);
    },
  });
}

// Hook para eliminar un evento
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const token = await getToken();
      const response = await fetch(`${API_ENDPOINTS.events}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token ?? ''}`,
        },
      });

      if (!response.ok) {
        let errorMsg = 'Error al eliminar el evento';
        try {
          const error = await response.json();
          errorMsg = error.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['all-events'] });

      queryClient.setQueryData(['events'], (oldEvents: Event[] | undefined) => {
        if (oldEvents) {
          return oldEvents.filter((event) => event.id_evento !== deletedId);
        }
        return [];
      });
    },
  });
}

export function useEventCategories() {
  const { getToken } = useAuth();
  return {
    // Unificar tipo de id a string
    add: async (eventId: string, categories: Array<{ id?: string; nombre?: string }>) => {
      const token = await getToken();
      const res = await fetch(`${API_ENDPOINTS.events}/${eventId}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ categories }),
      });
      if (!res.ok) throw new Error('Error al agregar categorías');
      return res.json();
    },
    remove: async (eventId: string, categoryId: string) => {
      const token = await getToken();
      const res = await fetch(`${API_ENDPOINTS.events}/${eventId}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });
      if (!res.ok) throw new Error('Error al remover categoría');
      return res.json();
    },
  };
}
