import { useAuth } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export function useClerkToken() {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const authToken = await getToken();
        setToken(authToken);
      } catch (error) {
        console.error('❌ Error getting token:', error);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [getToken]);

  return { token, isLoading };
}
