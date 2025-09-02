import { useState } from 'react';

interface GenerateDescriptionConfig {
  mood: 'creative' | 'professional' | 'fun';
  length: 'short' | 'medium' | 'long';
  additionalInstructions?: string;
  eventTitle?: string;
  eventType?: string;
}

interface GenerateDescriptionResponse {
  description: string;
  success: boolean;
}

interface UseDescriptionGeneratorReturn {
  generateDescription: (config: GenerateDescriptionConfig) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export function useDescriptionGenerator(): UseDescriptionGeneratorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDescription = async (config: GenerateDescriptionConfig): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar la descripción');
      }

      const data: GenerateDescriptionResponse = await response.json();
      
      if (!data.success || !data.description) {
        throw new Error('No se pudo generar la descripción');
      }

      return data.description;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error generating description:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    generateDescription,
    isLoading,
    error,
    clearError,
  };
}
