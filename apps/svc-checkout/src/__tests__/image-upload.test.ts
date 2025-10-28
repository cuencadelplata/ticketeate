import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de Cloudinary usando vi.hoisted para evitar problemas de hoisting
const mockCloudinary = vi.hoisted(() => ({
  uploader: {
    upload_stream: vi.fn(),
    destroy: vi.fn(),
  },
}));

vi.mock('../config/cloudinary', () => ({
  default: mockCloudinary,
}));

import { ImageUploadService } from '../services/image-upload';

describe('ImageUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockResult = {
        secure_url: 'https://example.com/image.jpg',
        public_id: 'image-123',
        format: 'jpg',
        bytes: 1024,
      };

      const mockUploadStream = {
        end: vi.fn(),
      };

      mockCloudinary.uploader.upload_stream.mockImplementation((_options, callback) => {
        // Simular callback exitoso
        setTimeout(() => callback(null, mockResult), 0);
        return mockUploadStream;
      });

      const buffer = Buffer.from('test image data');
      const result = await ImageUploadService.uploadImage(buffer);

      expect(result).toEqual({
        url: 'https://example.com/image.jpg',
        publicId: 'image-123',
        format: 'jpg',
        size: 1024,
      });

      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          folder: 'ticketeate/events',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        expect.any(Function),
      );

      expect(mockUploadStream.end).toHaveBeenCalledWith(buffer);
    });

    it('should upload image with custom folder', async () => {
      const mockResult = {
        secure_url: 'https://example.com/image.jpg',
        public_id: 'image-123',
        format: 'jpg',
        bytes: 1024,
      };

      const mockUploadStream = {
        end: vi.fn(),
      };

      mockCloudinary.uploader.upload_stream.mockImplementation((_options, callback) => {
        setTimeout(() => callback(null, mockResult), 0);
        return mockUploadStream;
      });

      const buffer = Buffer.from('test image data');
      const result = await ImageUploadService.uploadImage(buffer, 'custom-folder');

      expect(result).toEqual({
        url: 'https://example.com/image.jpg',
        publicId: 'image-123',
        format: 'jpg',
        size: 1024,
      });

      expect(mockCloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          folder: 'custom-folder',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        expect.any(Function),
      );
    });

    it('should handle upload errors', async () => {
      const uploadError = new Error('Upload failed');
      const mockUploadStream = {
        end: vi.fn(),
      };

      mockCloudinary.uploader.upload_stream.mockImplementation((_options, callback) => {
        setTimeout(() => callback(uploadError, null), 0);
        return mockUploadStream;
      });

      const buffer = Buffer.from('test image data');

      await expect(ImageUploadService.uploadImage(buffer)).rejects.toThrow(
        'Error uploading to Cloudinary: Upload failed',
      );
    });

    it('should handle case when result is null', async () => {
      const mockUploadStream = {
        end: vi.fn(),
      };

      mockCloudinary.uploader.upload_stream.mockImplementation((_options, callback) => {
        setTimeout(() => callback(null, null), 0);
        return mockUploadStream;
      });

      const buffer = Buffer.from('test image data');

      await expect(ImageUploadService.uploadImage(buffer)).rejects.toThrow(
        'No result from Cloudinary',
      );
    });

    it('should handle case when format is missing', async () => {
      const mockResult = {
        secure_url: 'https://example.com/image.jpg',
        public_id: 'image-123',
        format: undefined,
        bytes: 1024,
      };

      const mockUploadStream = {
        end: vi.fn(),
      };

      mockCloudinary.uploader.upload_stream.mockImplementation((_options, callback) => {
        setTimeout(() => callback(null, mockResult), 0);
        return mockUploadStream;
      });

      const buffer = Buffer.from('test image data');
      const result = await ImageUploadService.uploadImage(buffer);

      expect(result.format).toBe('jpg'); // Default format
    });

    it('should handle case when bytes is missing', async () => {
      const mockResult = {
        secure_url: 'https://example.com/image.jpg',
        public_id: 'image-123',
        format: 'jpg',
        bytes: undefined,
      };

      const mockUploadStream = {
        end: vi.fn(),
      };

      mockCloudinary.uploader.upload_stream.mockImplementation((_options, callback) => {
        setTimeout(() => callback(null, mockResult), 0);
        return mockUploadStream;
      });

      const buffer = Buffer.from('test image data');
      const result = await ImageUploadService.uploadImage(buffer);

      expect(result.size).toBe(0); // Default size
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      mockCloudinary.uploader.destroy.mockImplementation((_publicId, callback) => {
        setTimeout(() => callback(null, { result: 'ok' }), 0);
      });

      await expect(ImageUploadService.deleteImage('image-123')).resolves.toBeUndefined();

      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith(
        'image-123',
        expect.any(Function),
      );
    });

    it('should handle delete errors', async () => {
      const deleteError = new Error('Delete failed');

      mockCloudinary.uploader.destroy.mockImplementation((_publicId, callback) => {
        setTimeout(() => callback(deleteError, null), 0);
      });

      await expect(ImageUploadService.deleteImage('image-123')).rejects.toThrow(
        'Error deleting from Cloudinary: Delete failed',
      );
    });
  });
});
