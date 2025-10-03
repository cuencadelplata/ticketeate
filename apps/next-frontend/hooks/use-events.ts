import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
import { useSession } from '@/lib/auth-client';
import type {
  Event,
  CreateEventData,
  CreateEventResponse,
  GetEventsResponse,
  GetEventResponse,
  GetAllEventsResponse,
  GetPublicEventResponse,
} from '@/types/events';

// Hook para obtener eventos (protegido)
export function useEvents() {
  const session = useSession();
  const isAuthenticated = !!session.data?.user;

  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      const res = await fetch(API_ENDPOINTS.events, {
        // con Better Auth, si el endpoint está en el mismo dominio, las cookies httpOnly viajan solas
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al obtener eventos');
      const data: GetEventsResponse = await res.json();
      return data.events || [];
    },
    enabled: isAuthenticated,
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

export function usePublicEvent(id?: string) {
  return useQuery({
    queryKey: ['public-event', id],
    queryFn: async (): Promise<Event> => {
      const res = await fetch(API_ENDPOINTS.publicEventById(id as string), { credentials: 'include' });
      if (!res.ok) throw new Error('Error al obtener el evento');
      const data: GetPublicEventResponse = await res.json();
      return data.event;
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
}

export function useEvent(id: string) {
  const session = useSession();
  const isAuthenticated = !!session.data?.user;

  return useQuery({
    queryKey: ['events', id],
    queryFn: async (): Promise<Event> => {
      const res = await fetch(`${API_ENDPOINTS.events}/${id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Error al obtener el evento');
      const data: GetEventResponse = await res.json();
      return data.event;
    },
    enabled: !!id && isAuthenticated,
  });
}

 
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: CreateEventData): Promise<Event> => {
      const res = await fetch(API_ENDPOINTS.events, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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
        old ? [...old, newEvent] : [newEvent]
      );
    },
    onError: (error) => {
      console.error('Error al crear evento:', error);
    },
  });
}


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
      const res = await fetch(`${API_ENDPOINTS.events}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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
      queryClient.invalidateQueries({ queryKey: ['events', updatedEvent.id_evento] });
      queryClient.setQueryData(['events', updatedEvent.id_evento], updatedEvent);
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await fetch(`${API_ENDPOINTS.events}/${id}`, {
        method: 'DELETE',
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
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.setQueryData(['events'], (old: Event[] | undefined) =>
        old ? old.filter((e) => e.id_evento !== deletedId) : []
      );
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

// Hook para obtener todas las categorías disponibles
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }
      const data = await response.json();
      return data.categories || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
