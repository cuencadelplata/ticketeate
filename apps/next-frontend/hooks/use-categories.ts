import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/config';
import { categories as staticCategories } from '@/data/categories';
import { fetchWithApiKey } from '@/lib/fetch-api';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

// Hook para obtener categorías estáticas (sin query)
export function useCategories() {
  // Convertir las categorías estáticas al formato esperado
  const categories: Category[] = staticCategories.map((cat) => ({
    id: parseInt(cat.id),
    name: cat.name,
  }));

  return {
    data: categories,
    isLoading: false,
    error: null,
  };
}

// Hook para sincronizar categorías con la base de datos (solo cuando sea necesario)
export function useCategoriesSync() {
  return useQuery({
    queryKey: ['categories-sync'],
    queryFn: async (): Promise<Category[]> => {
      const res = await fetchWithApiKey(`${API_ENDPOINTS.events}/categories`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al obtener categorías');
      const data: CategoriesResponse = await res.json();
      return data.categories || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 horas - las categorías no cambian frecuentemente
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: false, // Solo se ejecuta cuando se llama manualmente
  });
}
