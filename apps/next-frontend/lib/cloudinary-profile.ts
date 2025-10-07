import { v2 as cloudinary } from 'cloudinary';
import { Buffer } from 'buffer';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface ProfileImageUploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
}

export interface ProfileImageDeleteResult {
  success: boolean;
  message: string;
}

export class CloudinaryProfileService {
  /**
   * Sube una imagen de perfil a Cloudinary
   */
  static async uploadProfileImage(
    fileBuffer: Buffer,
    userId: string,
    filename?: string,
  ): Promise<ProfileImageUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `ticketeate/profiles/${userId}`,
          public_id: filename ? `${filename}_${Date.now()}` : `profile_${Date.now()}`,
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { fetch_format: 'auto', quality: 'auto' },
          ],
          tags: ['profile', 'user', userId],
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Error uploading profile image to Cloudinary: ${error.message}`));
            return;
          }

          if (!result) {
            reject(new Error('No result from Cloudinary'));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format || 'jpg',
            size: result.bytes || 0,
          });
        },
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Elimina una imagen de perfil de Cloudinary
   */
  static async deleteProfileImage(publicId: string): Promise<ProfileImageDeleteResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(new Error(`Error deleting profile image from Cloudinary: ${error.message}`));
          return;
        }

        resolve({
          success: true,
          message:
            result?.result === 'ok' ? 'Image deleted successfully' : 'Image deletion completed',
        });
      });
    });
  }

  /**
   * Extrae el public_id de una URL de Cloudinary
   */
  static extractPublicIdFromUrl(url: string): string | null {
    try {
      // Patrón para URLs de Cloudinary: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
      const match = url.match(/\/image\/upload\/(?:v\d+\/)?([^\.]+)/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting public_id from URL:', error);
      return null;
    }
  }

  /**
   * Genera una URL optimizada para avatar con transformaciones específicas
   */
  static getOptimizedAvatarUrl(publicId: string, size: number = 150): string {
    return cloudinary.url(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      gravity: 'face',
      fetch_format: 'auto',
      quality: 'auto',
    });
  }

  /**
   * Genera una URL optimizada para imagen de perfil completa
   */
  static getOptimizedProfileUrl(
    publicId: string,
    width: number = 400,
    height: number = 400,
  ): string {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: 'fill',
      gravity: 'face',
      fetch_format: 'auto',
      quality: 'auto',
    });
  }
}
