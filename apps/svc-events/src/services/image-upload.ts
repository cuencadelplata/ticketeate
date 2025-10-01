import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
}

export class ImageUploadService {
  /**
   * Sube una imagen a Cloudinary
   */
  static async uploadImage(buffer: Buffer): Promise<UploadResult> {
    try {
      // Convertir buffer a base64 para Cloudinary
      const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;

      const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'ticketeate/events',
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
      };
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw new Error('Error al subir la imagen');
    }
  }

  /**
   * Elimina una imagen de Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw new Error('Error al eliminar la imagen');
    }
  }

  /**
   * Genera una URL optimizada para una imagen
   */
  static getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
    } = {}
  ): string {
    const { width, height, quality = 'auto', format = 'auto' } = options;

    let url = cloudinary.url(publicId, {
      quality,
      fetch_format: format,
      ...(width && { width }),
      ...(height && { height }),
    });

    return url;
  }
}
