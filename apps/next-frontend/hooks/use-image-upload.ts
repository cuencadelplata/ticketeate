import { useAuth } from '@clerk/nextjs';

export function useImageUpload() {
  const { getToken } = useAuth();

  const uploadImage = async (file: File) => {
    try {
      // Obtener token JWT válido para el backend
      const token = await getToken({ template: 'TicketeateHono' });

      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación');
      }

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          `Error subiendo imagen: ${res.status} - ${errorData.error || res.statusText}`
        );
      }

      return await res.json();
    } catch (error) {
      console.error('Error en uploadImage:', error);
      throw error;
    }
  };

  return { uploadImage };
}
