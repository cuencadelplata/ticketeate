import React, { useState, useRef, DragEvent, useEffect } from 'react';
import { Search, Upload, History, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface UploadImageModalProps {
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
}

interface UserImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
  size?: number;
}

const categories = [
  { id: 'biblioteca', label: 'Mi Biblioteca', icon: <History className="h-4 w-4" /> },
  { id: 'destacado', label: 'Destacado' },
  { id: 'eventos', label: 'Eventos anteriores' },
  { id: 'sanpatricio', label: 'San Patricio' },
  { id: 'fiesta', label: 'Fiesta' },
  { id: 'comida', label: 'Comida' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'deportes', label: 'Deportes' },
  { id: 'cripto', label: 'Cripto' },
  { id: 'abstracto', label: 'Abstracto' },
  { id: 'tecnologia', label: 'Tecnología' },
];

const imagesMapping: Record<string, string[]> = {
  destacado: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
  ],
  eventos: [
    'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1485217988980-11786ced9454?w=500&h=500&fit=crop',
  ],
  sanpatricio: [
    'https://images.unsplash.com/photo-1504198458649-3128b932f49b?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1503614472-8c5a4f7a4c6f?w=500&h=500&fit=crop',
  ],
  fiesta: [
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1496024840928-4c417adf211d?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=500&h=500&fit=crop',
  ],
  comida: [
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=500&h=500&fit=crop',
  ],
  bebidas: [
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1510627498534-cf7e9002facc?w=500&h=500&fit=crop',
  ],
  deportes: [
    'https://images.unsplash.com/photo-1571019613914-85f342c3c201?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&h=500&fit=crop',
  ],
  cripto: [
    'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&h=500&fit=crop',
  ],
  abstracto: [
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=500&h=500&fit=crop',
  ],
  tecnologia: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&h=500&fit=crop',
  ],
};

// Funciones para manejar la biblioteca de imágenes
const saveImageToLibrary = (imageData: UserImage) => {
  try {
    const existingImages = JSON.parse(localStorage.getItem('user-images') || '[]');
    const updatedImages = [imageData, ...existingImages].slice(0, 50); // Máximo 50 imágenes
    localStorage.setItem('user-images', JSON.stringify(updatedImages));
  } catch (error) {
    console.error('Error saving image to library:', error);
  }
};

const getUserImages = (): UserImage[] => {
  try {
    return JSON.parse(localStorage.getItem('user-images') || '[]');
  } catch (error) {
    console.error('Error loading user images:', error);
    return [];
  }
};

// Función para subir a Supabase (placeholder)
const uploadToSupabase = async (file: File): Promise<string | null> => {
  try {
    // Por ahora, devolvemos null para usar el fallback local
    // TODO: Implementar subida real a Supabase
    console.log('Supabase upload not implemented yet, using local fallback');
    return null;
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    return null;
  }
};

const deleteImageFromLibrary = (imageId: string) => {
  try {
    const existingImages = getUserImages();
    const updatedImages = existingImages.filter(img => img.id !== imageId);
    localStorage.setItem('user-images', JSON.stringify(updatedImages));
  } catch (error) {
    console.error('Error deleting image from library:', error);
  }
};

const UploadImageModal: React.FC<UploadImageModalProps> = ({ onClose, onSelectImage }) => {
  const [selectedCategory, setSelectedCategory] = useState('biblioteca');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [userImages, setUserImages] = useState<UserImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar imágenes del usuario al montar el componente
  useEffect(() => {
    setUserImages(getUserImages());
  }, []);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. El tamaño máximo es 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido.');
      return;
    }

    setIsUploading(true);

    try {
      // Subir a Supabase Storage
      const imageUrl = await uploadToSupabase(file);

      if (imageUrl) {
        // Guardar en la biblioteca
        const newImage: UserImage = {
          id: Date.now().toString(),
          url: imageUrl,
          name: file.name,
          uploadedAt: new Date().toISOString(),
          size: file.size,
        };

        saveImageToLibrary(newImage);
        setUserImages(getUserImages());

        toast.success('Imagen subida exitosamente');
        onSelectImage(imageUrl);
      } else {
        // Fallback: usar base64 para preview local
        toast.warning('Usando vista previa local de la imagen');
        const reader = new FileReader();
        reader.onload = e => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            // Guardar también las imágenes base64 en la biblioteca
            const newImage: UserImage = {
              id: Date.now().toString(),
              url: result,
              name: file.name,
              uploadedAt: new Date().toISOString(),
              size: file.size,
            };

            saveImageToLibrary(newImage);
            setUserImages(getUserImages());

            onSelectImage(result);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen';

      if (errorMessage.includes('Supabase no está configurado')) {
        toast.warning('Supabase no configurado', {
          description: 'Usando vista previa local. Configura Supabase para subir imágenes.',
        });
      } else {
        toast.error(errorMessage);
      }

      // Fallback: usar base64 para preview local
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          // Guardar también las imágenes base64 en la biblioteca
          const newImage: UserImage = {
            id: Date.now().toString(),
            url: result,
            name: file.name,
            uploadedAt: new Date().toISOString(),
            size: file.size,
          };

          saveImageToLibrary(newImage);
          setUserImages(getUserImages());

          onSelectImage(result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteImageFromLibrary(imageId);
    setUserImages(getUserImages());
    toast.success('Imagen eliminada de la biblioteca');
  };

  // Obtiene las imágenes y el título de la categoría seleccionada
  const imagesForCategory =
    selectedCategory === 'biblioteca'
      ? userImages.map(img => img.url)
      : imagesMapping[selectedCategory] || [];
  const categoryLabel = categories.find(cat => cat.id === selectedCategory)?.label || '';

  return (
    <div className="fixed inset-0 z-50 flex w-full items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-5xl overflow-hidden rounded-lg bg-[#2B2B2B]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-700 px-6 py-2">
          <h2 className="text-base font-medium text-white">Elegir imagen</h2>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-white">
            ✕
          </button>
        </div>

        {/* Área de carga */}
        <div className="border-b border-gray-700 p-3">
          <div
            className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept="image/*"
              className="hidden"
            />
            {isUploading ? (
              <>
                <Upload className="mx-auto mb-2 h-8 w-8 animate-pulse text-blue-500" />
                <p className="mb-1 text-blue-300">Subiendo imagen...</p>
                <p className="text-sm text-gray-500">Por favor espera</p>
              </>
            ) : (
              <>
                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="mb-1 text-gray-300">Arrastra y suelta o haz clic aquí para subir.</p>
                <p className="text-sm text-gray-500">
                  O elige una imagen a continuación. La relación de aspecto ideal es 1:1.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Buscar más fotos"
              className="w-full rounded-md border border-gray-700 bg-[#1E1E1E] py-2 pl-10 pr-4 text-sm text-white focus:border-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Categorías */}
        <div className="px-3">
          <div className="scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-2 transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-sm text-white'
                    : 'bg-[#1E1E1E] text-sm text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.icon && category.icon}
                {category.label}
                {category.id === 'biblioteca' && userImages.length > 0 && (
                  <span className="ml-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                    {userImages.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de imágenes */}
        <div className="px-3 py-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-base font-medium text-white">{categoryLabel}</h3>
            {selectedCategory === 'biblioteca' && userImages.length > 0 && (
              <span className="text-sm text-gray-400">
                {userImages.length} imagen{userImages.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>

          {selectedCategory === 'biblioteca' && userImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="mb-3 h-12 w-12 text-gray-500" />
              <p className="text-gray-400">No hay imágenes en tu biblioteca</p>
              <p className="text-sm text-gray-500">Las imágenes que subas aparecerán aquí</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {selectedCategory === 'biblioteca'
                ? userImages.map(userImage => (
                    <div key={userImage.id} className="group relative">
                      <button
                        onClick={() => onSelectImage(userImage.url)}
                        className="aspect-square w-full overflow-hidden rounded-lg transition-all hover:ring-2 hover:ring-blue-500"
                      >
                        <img
                          src={userImage.url}
                          alt={userImage.name}
                          className="h-full w-full object-cover"
                        />
                      </button>
                      <button
                        onClick={e => handleDeleteImage(userImage.id, e)}
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="truncate text-xs text-white">{userImage.name}</p>
                        <p className="text-xs text-gray-300">
                          {new Date(userImage.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                : imagesForCategory.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => onSelectImage(image)}
                      className="aspect-square overflow-hidden rounded-lg transition-all hover:ring-2 hover:ring-blue-500"
                    >
                      <img
                        src={image}
                        alt={`${categoryLabel} image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadImageModal;
