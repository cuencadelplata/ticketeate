import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración por defecto para queries
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos (anteriormente cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Configuración por defecto para mutations
      retry: 1,
    },
  },
});
