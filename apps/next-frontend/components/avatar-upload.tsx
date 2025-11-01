'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, X, User } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import Image from 'next/image';

export default function AvatarUpload() {
  const { data: session, refetch: refetchSession } = useSession();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentImage = session?.user?.image;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Solo se permiten imágenes (JPG, PNG, WEBP)');
      return;
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Subir archivo
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al subir la imagen');
      }

      await response.json();

      // Refrescar la sesión para obtener la nueva imagen
      await refetchSession();
      setPreview(null);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al subir la imagen');
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!currentImage) return;

    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar tu foto de perfil?');
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/upload-avatar', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar la imagen');
      }

      // Refrescar la sesión
      await refetchSession();
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al eliminar la imagen');
    } finally {
      setDeleting(false);
    }
  };

  const displayImage = preview || currentImage;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative">
        <div className="h-32 w-32 rounded-full border-4 border-gray-200 bg-gray-100 overflow-hidden">
          {displayImage ? (
            <Image
              src={displayImage}
              alt="Avatar"
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
              <User className="h-16 w-16 text-white" />
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {(uploading || deleting) && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}

        {/* Upload button */}
        {!uploading && !deleting && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 rounded-full bg-blue-600 p-2 text-white shadow-lg hover:bg-blue-700 transition-colors"
            disabled={uploading || deleting}
          >
            <Camera className="h-5 w-5" />
          </button>
        )}

        {/* Delete button */}
        {currentImage && !uploading && !deleting && (
          <button
            onClick={handleDelete}
            className="absolute top-0 right-0 rounded-full bg-red-600 p-2 text-white shadow-lg hover:bg-red-700 transition-colors"
            disabled={uploading || deleting}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading || deleting}
      />

      {/* Error message */}
      {error && <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}

      {/* Info text */}
      <p className="text-center text-sm text-gray-500">
        {uploading
          ? 'Subiendo imagen...'
          : deleting
            ? 'Eliminando imagen...'
            : 'Haz clic en el icono de cámara para cambiar tu foto'}
        <br />
        <span className="text-xs">JPG, PNG o WEBP. Máximo 5MB</span>
      </p>
    </div>
  );
}
