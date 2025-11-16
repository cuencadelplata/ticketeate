import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook para hacer prefetch de datos de secciones de manage
 * Cuando el usuario entra a la página de manage, preloads datos de:
 * - Invitados
 * - Colaboradores
 * - Cupones
 * - Inscriptos
 */
export function usePrefetchManageData(eventId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!eventId) return;

    // Prefetch de invitados
    queryClient.prefetchQuery({
      queryKey: ['invitados', eventId],
      queryFn: async () => {
        const res = await fetch(`/api/administrador/invitados?eventId=${eventId}`);
        if (!res.ok) throw new Error('Failed to fetch invitados');
        return res.json();
      },
      staleTime: 1000 * 60 * 5, // 5 minutos
    });

    // Prefetch de colaboradores (códigos de invitación)
    queryClient.prefetchQuery({
      queryKey: ['invite_codes', eventId],
      queryFn: async () => {
        const res = await fetch(`/api/auth/invite-codes?eventId=${eventId}`);
        if (!res.ok) throw new Error('Failed to fetch invite codes');
        return res.json();
      },
      staleTime: 1000 * 60 * 5,
    });

    // Prefetch de cupones
    queryClient.prefetchQuery({
      queryKey: ['cupones', eventId],
      queryFn: async () => {
        const res = await fetch(`/api/cupones?eventId=${eventId}`);
        if (!res.ok) throw new Error('Failed to fetch cupones');
        return res.json();
      },
      staleTime: 1000 * 60 * 5,
    });

    // Prefetch de inscriptos
    queryClient.prefetchQuery({
      queryKey: ['inscripciones', eventId],
      queryFn: async () => {
        const res = await fetch(`/api/eventos/inscripciones?eventId=${eventId}`);
        if (!res.ok) throw new Error('Failed to fetch inscripciones');
        return res.json();
      },
      staleTime: 1000 * 60 * 5,
    });
  }, [eventId, queryClient]);
}
