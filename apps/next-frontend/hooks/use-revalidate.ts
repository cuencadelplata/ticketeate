import { useMutation } from '@tanstack/react-query';

interface RevalidateEventParams {
  eventId: string;
  secret?: string;
}

interface RevalidateMultipleParams {
  eventIds: string[];
  secret?: string;
}

// Hook para revalidar un solo evento
export function useRevalidateEvent() {
  return useMutation({
    mutationFn: async ({ eventId, secret }: RevalidateEventParams) => {
      const response = await fetch('/api/revalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          // Solo incluir secret si se pasa explícitamente (para webhooks)
          ...(secret && { secret }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to revalidate');
      }

      return response.json();
    },
  });
}

// Hook para revalidar múltiples eventos
export function useRevalidateMultipleEvents() {
  return useMutation({
    mutationFn: async ({ eventIds, secret }: RevalidateMultipleParams) => {
      const response = await fetch('/api/revalidate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventIds,
          // Solo incluir secret si se pasa explícitamente (para webhooks)
          ...(secret && { secret }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to revalidate');
      }

      return response.json();
    },
  });
}
