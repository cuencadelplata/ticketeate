import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Tipos para las respuestas de la API
interface ProfileData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
}

interface OtpResponse {
  success: boolean;
  message: string;
}

interface PasswordResetResponse {
  success: boolean;
  message: string;
}

interface ImageUploadResponse {
  success: boolean;
  imageUrl: string;
  imageId: string;
}

// Hook para obtener el perfil del usuario
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<ProfileData> => {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Error al cargar el perfil');
      }
      const data = await response.json();
      return data.user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para actualizar el perfil
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<ProfileData> => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar el perfil');
      }

      const result = await response.json();
      return result.user;
    },
    onSuccess: (data, variables) => {
      // Actualizar el cache del perfil
      queryClient.setQueryData(['profile'], data);

      toast.success('Perfil actualizado correctamente');

      // Si cambió el email, mostrar mensaje adicional
      if (variables.email) {
        toast.info('Se ha enviado un correo de verificación a tu nuevo email');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook para subir imagen de perfil
export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<ImageUploadResponse> => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/profile/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al subir la imagen');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      // Actualizar el cache del perfil con la nueva imagen
      queryClient.setQueryData(['profile'], (oldData: ProfileData | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, image: data.imageUrl };
      });

      toast.success('Imagen de perfil actualizada');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook para eliminar imagen de perfil
export function useDeleteProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch('/api/profile/image', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar la imagen');
      }
    },
    onSuccess: () => {
      // Actualizar el cache del perfil removiendo la imagen
      queryClient.setQueryData(['profile'], (oldData: ProfileData | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, image: null };
      });

      toast.success('Imagen de perfil eliminada');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook para enviar código OTP
export function useSendOtp() {
  return useMutation({
    mutationFn: async (email: string): Promise<OtpResponse> => {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send',
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar el código OTP');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Código OTP enviado a tu correo electrónico');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook para verificar código OTP
export function useVerifyOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }): Promise<OtpResponse> => {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          email,
          otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al verificar el código OTP');
      }

      return await response.json();
    },
    onSuccess: () => {
      // Invalidar y recargar el perfil para actualizar emailVerified
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Email verificado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Hook para solicitar restablecimiento de contraseña
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string): Promise<PasswordResetResponse> => {
      const response = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'forgot',
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar el enlace de restablecimiento');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Se ha enviado un enlace de restablecimiento a tu correo');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
