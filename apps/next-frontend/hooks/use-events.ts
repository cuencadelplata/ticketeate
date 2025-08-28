import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Event {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  access: string;
  location: string;
  description: string;
  pricingType: string;
  capacity: number | null;
  imageUrl?: string;
}

interface CreateEventData {
  name: string;
  startDate: string;
  endDate: string;
  access: string;
  location: string;
  description: string;
  pricingType: string;
  capacity: number | null;
  imageUrl?: string;
}

// Hook para obtener eventos
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Error al obtener eventos');
      }
      return response.json();
    },
  });
}

// Hook para obtener un evento específico
export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async (): Promise<Event> => {
      const response = await fetch(`/api/events/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener el evento');
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Hook para crear un evento
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: CreateEventData): Promise<Event> => {
      const response = await fetch('/api/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear el evento');
      }

      return response.json();
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
      queryClient.invalidateQueries({ queryKey: ['events', updatedEvent.id] });

      queryClient.setQueryData(['events', updatedEvent.id], updatedEvent);
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
          return oldEvents.filter(event => event.id !== deletedId);
        }
        return [];
      });
    },
  });
}
