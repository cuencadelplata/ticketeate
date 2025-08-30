import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
import { useClerkToken } from './use-clerk-token';

interface Event {
  id_evento: string;
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_creacion?: string;
  fecha_inicio_venta: string;
  fecha_fin_venta: string;
  estado?: string;
  imagenes_evento: Array<{
    id_imagen: string;
    url: string;
    tipo?: string;
  }>;
}

interface CreateEventData {
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_inicio_venta: string;
  fecha_fin_venta: string;
  estado?: string;
  imageUrl?: string;
}

// Hook para obtener eventos
export function useEvents() {
  const { token } = useClerkToken();

  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(API_ENDPOINTS.events, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al obtener eventos');
      }
      const data = await response.json();
      return data.events || [];
    },
  });
}

// Hook para obtener un evento específico
export function useEvent(id: string) {
  const { token } = useClerkToken();

  return useQuery({
    queryKey: ['events', id],
    queryFn: async (): Promise<Event> => {
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_ENDPOINTS.events}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error al obtener el evento');
      }
      const data = await response.json();
      return data.event;
    },
    enabled: !!id,
  });
}

// Hook para crear un evento
export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { token } = useClerkToken();

  return useMutation({
    mutationFn: async (eventData: CreateEventData): Promise<Event> => {
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(API_ENDPOINTS.events, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear el evento');
      }

      const data = await response.json();
      return data.event;
    },
    onSuccess: newEvent => {
      queryClient.invalidateQueries({ queryKey: ['events'] });

      queryClient.setQueryData(['events'], (oldEvents: Event[] | undefined) => {
        if (oldEvents) {
          return [...oldEvents, newEvent];
        }
        return [newEvent];
      });
    },
    onError: error => {
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
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar el evento');
      }

      return response.json();
    },
    onSuccess: updatedEvent => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['events', updatedEvent.id_evento] });

      queryClient.setQueryData(['events', updatedEvent.id_evento], updatedEvent);
    },
  });
}

// Hook para eliminar un evento
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar el evento');
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });

      queryClient.setQueryData(['events'], (oldEvents: Event[] | undefined) => {
        if (oldEvents) {
          return oldEvents.filter(event => event.id_evento !== deletedId);
        }
        return [];
      });
    },
  });
}
