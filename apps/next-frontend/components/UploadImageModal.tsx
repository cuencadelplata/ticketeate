import React, { useState, useRef, DragEvent, useEffect } from 'react';
import { Search, Upload, History, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { useImageUpload } from '@/hooks/use-image-upload';

interface UploadImageModalProps {
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  maxImages?: number;
  currentImages?: number;
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
  { id: 'teatro', label: 'Teatro' },
  { id: 'fiesta', label: 'Fiesta' },
  { id: 'retro', label: 'Retro' },
  { id: 'frases', label: 'Frases' },
  { id: 'geometrica', label: 'Geometrica' },
  { id: 'musica', label: 'Musica' },
  { id: 'tecnologia', label: 'Tecnología' },
];

const imagesMapping: Record<string, string[]> = {
  destacado: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838351/01_k5fyfl.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838350/02_c1hjhl.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838350/03_v69k6f.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838350/04_n5jgnw.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838350/05_grx8i8.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838350/06_gabtdh.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838350/07_ctn24o.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838350/08_msapmt.jpg'
  ],
  teatro: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838344/08_qbpkv0.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838343/07_qve3fa.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838343/06_kig1y0.avif',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838341/03_wlferm.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838341/05_yii5wz.avif',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838341/04_c4ant0.avif',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838341/02_hpvqwi.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838340/01_cnsyst.jpg'
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
  retro: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838338/08_z7uqvr.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838337/10_d3b08s.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838337/11_yy1v2d.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838337/12_iflyqw.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838337/06_uvmxne.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838336/07_nuvpqa.webp',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838336/09_hdtpoh.webp',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838335/05_cw7zgj.avif',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838335/04_ppfzjh.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838335/02_sk05tr.png',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838335/01_suquw2.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838335/03_rwwya1.jpg',
  ],
  frases: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838334/07_ngtav0.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838334/08_b5i9ni.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838333/06_ztnibz.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838332/05_xxkwft.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838331/04_tcyyjg.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838331/03_hbk29j.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838330/02_emj01v.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838330/01_gvuqvl.jpg'
  ],
  geometrica: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838333/07_toa9uf.webp',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838333/13_dzvtf1.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838332/10_xh8ok5.webp',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838332/12_se132g.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838331/09_tlncga.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838331/08_ssom8t.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838331/04_i4gmx0.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838330/06_jtwmt5.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838330/05_wqyxwm.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838329/02_dtwlhr.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838329/03_jrkgrp.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838328/01_xustcu.jpg'
  ],
  musica: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838335/01_tr9xyl.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838333/03_fkagvt.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838333/02_hzzfpk.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838331/05_tjtrsc.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838330/07_ubqvoe.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838329/08_kk1z7h.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838329/06_loavyr.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838329/04_a4d3p5.jpg'
  ],
  tecnologia: [
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838350/07_hoapm8.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838341/04_fvc0im.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838340/08_r42uoq.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838340/06_zn1wna.webp',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838340/03_bwr1aj.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838339/02_zaxr5n.jpg',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838339/05_fyinmd.png',
    'https://res.cloudinary.com/dvssnomng/image/upload/v1756838338/01_sse632.jpg'
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

const deleteImageFromLibrary = (imageId: string) => {
  try {
    const existingImages = JSON.parse(localStorage.getItem('user-images') || '[]');
    const updatedImages = existingImages.filter((img: UserImage) => img.id !== imageId);
    localStorage.setItem('user-images', JSON.stringify(updatedImages));
  } catch (error) {
    console.error('Error deleting image from library:', error);
  }
};

export default function UploadImageModal({
  onClose,
  onSelectImage,
  maxImages = 4,
  currentImages = 0,
}: UploadImageModalProps) {
  const [selectedCategory, setSelectedCategory] = useState('biblioteca');
  const [searchTerm, setSearchTerm] = useState('');
  const [userImages, setUserImages] = useState<UserImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Usar el hook de subida de imágenes
  const { uploadImage } = useImageUpload();

  useEffect(() => {
    setUserImages(getUserImages());
  }, []);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFiles(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files[0]);
    }
  };

  const handleFiles = async (uploadedFile: File) => {
    if (!uploadedFile.type.startsWith('image/')) {
      toast.error('Por favor, selecciona un archivo de imagen válido.');
      return;
    }

    if (currentImages >= maxImages) {
      toast.error(
        `Máximo ${maxImages} imagen${maxImages > 1 ? 'es' : ''} permitida${maxImages > 1 ? 's' : ''}`
      );
      return;
    }

    try {
      setIsUploading(true);

      // Subir imagen usando el hook
      const result = await uploadImage(uploadedFile);

      // Guardar en la biblioteca local
      const newImage: UserImage = {
        id: Date.now().toString(),
        url: result.image.url,
        name: uploadedFile.name,
        uploadedAt: new Date().toISOString(),
        size: result.image.size,
      };

      saveImageToLibrary(newImage);
      setUserImages(getUserImages());

      toast.success('Imagen subida exitosamente a Cloudinary');
      onSelectImage(result.image.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen. Inténtalo de nuevo.');
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
            <X className="h-4 w-4" />
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
                {maxImages > 1 && (
                  <p className="text-xs text-gray-600">
                    {currentImages}/{maxImages} imágenes seleccionadas
                  </p>
                )}
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
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
            <div className="max-h-56 overflow-y-auto">
              <div className="grid grid-cols-4 gap-2">
                {selectedCategory === 'biblioteca'
                  ? userImages.map(userImage => (
                      <div key={userImage.id} className="group relative">
                        <button
                          onClick={() => {
                            if (currentImages >= maxImages) {
                              toast.error(
                                `Máximo ${maxImages} imagen${maxImages > 1 ? 'es' : ''} permitida${maxImages > 1 ? 's' : ''}`
                              );
                              return;
                            }
                            onSelectImage(userImage.url);
                          }}
                          className="relative aspect-square w-full overflow-hidden rounded-lg transition-all hover:ring-2 hover:ring-blue-500"
                        >
                                                  <Image
                          src={userImage.url}
                          alt={userImage.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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
                        onClick={() => {
                          if (currentImages >= maxImages) {
                            toast.error(
                              `Máximo ${maxImages} imagen${maxImages > 1 ? 'es' : ''} permitida${maxImages > 1 ? 's' : ''}`
                            );
                            return;
                          }
                          onSelectImage(image);
                        }}
                        className="relative aspect-square overflow-hidden rounded-lg transition-all hover:ring-2 hover:ring-blue-500"
                      >
                                              <Image
                        src={image}
                        alt={`${categoryLabel} image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      </button>
                    ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
