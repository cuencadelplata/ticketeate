import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface UseInviteCodeResponse {
  success: boolean;
  message?: string;
  eventoid?: string;
  colaborador_evento_id?: string;
}

export function useGetMyColaboradorEvents() {
  return useQuery({
    queryKey: ['myColaboradorEvents'],
    queryFn: async () => {
      const response = await fetch('/api/colaborador/mis-eventos', {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener eventos');
      }

      const data = await response.json();
      return data.eventos;
    },
  });
}

export function useUseColaboradorInviteCode() {
  const queryClient = useQueryClient();

  return useMutation<UseInviteCodeResponse, Error, string>({
    mutationFn: async (codigo: string) => {
      const response = await fetch('/api/invite-codes/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al validar código');
      }

      return data as UseInviteCodeResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myColaboradorEvents'] });
    },
  });
}
