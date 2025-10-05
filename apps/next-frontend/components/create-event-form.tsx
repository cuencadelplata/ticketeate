'use client';
import { useImageUpload } from '@/hooks/use-image-upload';
import { toast } from 'sonner';

export default function CreateEventForm() {
  const { uploadImage } = useImageUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadImage(file);
      toast.success('Imagen subida correctamente 🎉');
      console.log('Resultado del backend:', result);
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message || 'Error al subir imagen');
    }
  };

  return (
    <div className="p-6 text-stone-200">
      <h1 className="text-xl font-semibold mb-3">Subir imagen de evento</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-400 file:mr-4 file:rounded-md file:border-0 file:bg-orange-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-orange-700"
      />
    </div>
  );
}
