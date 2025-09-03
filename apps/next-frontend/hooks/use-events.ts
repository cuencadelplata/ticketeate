import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
import { useAuth } from '@clerk/nextjs';
import type {
  Event,
  CreateEventData,
  CreateEventResponse,
  GetEventsResponse,
  GetEventResponse,
} from '@/types/events';

export const EVENTS_QUERY_KEY = ['events'];
export const eventKey = (id: string) => [...EVENTS_QUERY_KEY, id] as const;

//FETCH con auth + reintento en 401
async function fetchWithAuth (url: string, getToken: () => Promise<string | null>, init: RequestInit = {}) {
  const token = await getToken();
  const withAuth = (t: string | null) => ({
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${t ?? ''}`,
      'Content-Type': (init.headers as any)?.['Content-Type'] ?? (init.body ? 'application/json' : undefined),
    },
  });

  let res = await fetch(url, withAuth(token));
  if (res.status === 401) {
    const newToken = await getToken();
    res = await fetch(url, withAuth(newToken));
  }
  return res;
}

// Hook para obtener eventos
export function useEvents() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: async (): Promise<Event[]> => {
      const response = await fetchWithAuth(API_ENDPOINTS.events, getToken);
      if (!response.ok) throw new Error('Error al obtener eventos');
      const data: GetEventsResponse = await response.json();
      return data.events || [];
    },
  });
}

// Hook para obtener un evento específico
export function useEvent(id: string) {
  const { getToken } = useAuth();

   return useQuery({
    queryKey: eventKey(id),                                           // <- antes ['events', id]
    queryFn: async (): Promise<Event> => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.events}/${id}`, getToken); // <- antes fetch manual
      if (!response.ok) throw new Error('Error al obtener el evento');
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
      const response = await fetchWithAuth(API_ENDPOINTS.events, getToken, { // <- antes fetch manual
        method: 'POST',
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        let msg = 'Error al crear el evento';
        try { const e = await response.json(); msg = e.error || msg; } catch {}
        throw new Error(msg);
      }
      const data: CreateEventResponse = await response.json();
      return data.event;
    },
    onSuccess: newEvent => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });        // <- antes ['events'] literal
      queryClient.setQueryData(EVENTS_QUERY_KEY, (old: Event[] | undefined) =>
        old ? [...old, newEvent] : [newEvent]
      );
      if (newEvent?.id_evento) {                                            // <- NUEVO: cache del detalle
        queryClient.setQueryData(eventKey(newEvent.id_evento), newEvent);
      }
    },
    onError: err => console.error('Error al crear evento:', err),
  });
}

// Hook para actualizar un evento
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({ id, eventData }: { id: string; eventData: Partial<CreateEventData>; }): Promise<Event> => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.events}/${id}`, getToken, { // <- antes /api/... sin token
        method: 'PUT',
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        let msg = 'Error al actualizar el evento';
        try { const e = await response.json(); msg = e.error || msg; } catch {}
        throw new Error(msg);
      }
      return response.json();
    },
    onSuccess: updatedEvent => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });         // <- key estable
      if (updatedEvent?.id_evento) {
        queryClient.invalidateQueries({ queryKey: eventKey(updatedEvent.id_evento) });
        queryClient.setQueryData(eventKey(updatedEvent.id_evento), updatedEvent);
      }
      // actualizar en la lista cacheada
      queryClient.setQueryData(EVENTS_QUERY_KEY, (old: Event[] | undefined) =>
        !old ? old : old.map(e => (e.id_evento === updatedEvent.id_evento ? updatedEvent : e))
      );
    },
  });
}

// Hook para eliminar un evento
export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetchWithAuth(`${API_ENDPOINTS.events}/${id}`, getToken, { // <- antes /api/... sin token
        method: 'DELETE',
      });
      if (!response.ok) {
        let msg = 'Error al eliminar el evento';
        try { const e = await response.json(); msg = e.error || msg; } catch {}
        throw new Error(msg);
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });           // <- key estable
      queryClient.setQueryData(EVENTS_QUERY_KEY, (old: Event[] | undefined) =>
        old ? old.filter(e => e.id_evento !== deletedId) : []
      );
      queryClient.removeQueries({ queryKey: eventKey(deletedId) });            // <- NUEVO: limpia detalle
    },
  });
}
