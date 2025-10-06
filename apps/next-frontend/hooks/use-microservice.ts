'use client';

import { authClient } from '@/lib/auth-client';
import { useState } from 'react';

interface MicroserviceRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

interface MicroserviceResponse<T = any> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useMicroservice() {
  const [loading, setLoading] = useState(false);

  const request = async <T = any>(
    endpoint: string,
    options: MicroserviceRequestOptions = {}
  ): Promise<MicroserviceResponse<T>> => {
    setLoading(true);
    
    try {
      // Obtener el token JWT
      const { data: tokenData, error: tokenError } = await authClient.token();
      
      if (tokenError || !tokenData?.token) {
        return {
          data: null,
          error: 'No se pudo obtener el token JWT. Asegúrate de estar autenticado.',
          loading: false,
        };
      }

      // Configurar headers
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${tokenData.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Hacer la petición al microservicio
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          data: null,
          error: `Error del microservicio (${response.status}): ${errorText}`,
          loading: false,
        };
      }

      const data = await response.json();
      return {
        data,
        error: null,
        loading: false,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Error desconocido',
        loading: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    request,
    loading,
  };
}

// Hook específico para obtener el perfil del usuario
export function useUserProfile() {
  const { request, loading } = useMicroservice();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    const result = await request('/api/protected/profile');
    setProfile(result.data);
    setError(result.error);
  };

  return {
    profile,
    error,
    loading,
    fetchProfile,
  };
}
