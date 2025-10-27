import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageUploadService } from '../services/image-upload';

// Mock Cloudinary
vi.mock('../config/cloudinary', () => ({
  default: {
    uploader: {
      upload_stream: vi.fn(),
      destroy: vi.fn(),
    },
  },
}));

describe('ImageUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const cloudinary = await import('../config/cloudinary');
      const mockUploadStream = vi.fn();

      vi.mocked(cloudinary.default.uploader.upload_stream).mockImplementation(
        (options, callback) => {
          // Simulate successful upload
          setTimeout(() => {
            callback(null, {
              secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg',
              public_id: 'test/test-image',
              format: 'jpg',
              bytes: 1024,
            });
          }, 0);

          return {
            end: mockUploadStream,
          };
        },
      );

      const buffer = Buffer.from('fake-image-data');
      const result = await ImageUploadService.uploadImage(buffer);

      expect(result).toEqual({
        url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg',
        publicId: 'test/test-image',
        format: 'jpg',
        size: 1024,
      });
      expect(mockUploadStream).toHaveBeenCalledWith(buffer);
    });

    it('should upload image with custom folder', async () => {
      const cloudinary = await import('../config/cloudinary');
      const mockUploadStream = vi.fn();

      vi.mocked(cloudinary.default.uploader.upload_stream).mockImplementation(
        (options, callback) => {
          expect(options.folder).toBe('custom/folder');

          setTimeout(() => {
            callback(null, {
              secure_url: 'https://res.cloudinary.com/test/image/upload/v1234567890/test.jpg',
              public_id: 'custom/folder/test-image',
              format: 'jpg',
              bytes: 1024,
            });
          }, 0);

          return {
            end: mockUploadStream,
          };
        },
      );

      const buffer = Buffer.from('fake-image-data');
      const result = await ImageUploadService.uploadImage(buffer, 'custom/folder');

      expect(result.publicId).toBe('custom/folder/test-image');
    });

    it('should handle upload errors', async () => {
      const cloudinary = await import('../config/cloudinary');
      const mockUploadStream = vi.fn();

      vi.mocked(cloudinary.default.uploader.upload_stream).mockImplementation(
        (options, callback) => {
          setTimeout(() => {
            callback(new Error('Upload failed'), null);
          }, 0);

          return {
            end: mockUploadStream,
          };
        },
      );

      const buffer = Buffer.from('fake-image-data');

      await expect(ImageUploadService.uploadImage(buffer)).rejects.toThrow(
        'Error uploading to Cloudinary: Upload failed',
      );
    });

    it('should handle null result from Cloudinary', async () => {
      const cloudinary = await import('../config/cloudinary');
      const mockUploadStream = vi.fn();

      vi.mocked(cloudinary.default.uploader.upload_stream).mockImplementation(
        (options, callback) => {
          setTimeout(() => {
            callback(null, null);
          }, 0);

          return {
            end: mockUploadStream,
          };
        },
      );

      const buffer = Buffer.from('fake-image-data');

      await expect(ImageUploadService.uploadImage(buffer)).rejects.toThrow(
        'No result from Cloudinary',
      );
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const cloudinary = await import('../config/cloudinary');

      vi.mocked(cloudinary.default.uploader.destroy).mockImplementation((publicId, callback) => {
        setTimeout(() => {
          callback(null, { result: 'ok' });
        }, 0);
      });

      await expect(ImageUploadService.deleteImage('test/test-image')).resolves.toBeUndefined();
    });

    it('should handle delete errors', async () => {
      const cloudinary = await import('../config/cloudinary');

      vi.mocked(cloudinary.default.uploader.destroy).mockImplementation((publicId, callback) => {
        setTimeout(() => {
          callback(new Error('Delete failed'), null);
        }, 0);
      });

      await expect(ImageUploadService.deleteImage('test/test-image')).rejects.toThrow(
        'Error deleting from Cloudinary: Delete failed',
      );
    });
  });
});

