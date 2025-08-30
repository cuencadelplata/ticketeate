import cloudinary from '../config/cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  size: number;
}

export class ImageUploadService {
  static async uploadImage(
    fileBuffer: Buffer,
    folder: string = 'ticketeate/events'
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(
              new Error(`Error uploading to Cloudinary: ${error.message}`)
            );
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
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  static async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, _result) => {
        if (error) {
          reject(new Error(`Error deleting from Cloudinary: ${error.message}`));
          return;
        }
        resolve();
      });
    });
  }
}
