'use client';

export function useImageUpload() {
  const getToken = async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/auth/token', { cache: 'no-store' });
      if (!res.ok) {
        console.error('Error obteniendo token JWT:', res.statusText);
        return null;
      }
      const data = await res.json();
      return typeof data.token === 'string' ? data.token : null;
    } catch (error) {
      console.error('Error al solicitar el token JWT:', error);
      return null;
    }
  };

  const uploadImage = async (file: File) => {
    if (!(file instanceof File)) {
      throw new Error('El parámetro debe ser un archivo válido.');
    }

    if (typeof window === 'undefined') {
      throw new Error('Este hook solo puede ejecutarse en el cliente.');
    }

    const token = await getToken();
    if (!token) {
      throw new Error('No se pudo obtener el token de autenticación.');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let message = `Error al subir la imagen (${response.status})`;
        try {
          const errorData = await response.json();
          message += `: ${errorData.error || response.statusText}`;
        } catch {}
        throw new Error(message);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en uploadImage:', error);
      throw error;
    }
  };

  return { uploadImage };
}
