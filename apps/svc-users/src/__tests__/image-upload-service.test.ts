import { describe, it, expect, vi } from 'vitest';

// Mock cloudinary
const mockCloudinary = {
  uploader: {
    upload_stream: vi.fn(),
    destroy: vi.fn(),
  },
};

vi.mock('../config/cloudinary', () => ({
  default: mockCloudinary,
}));

describe('ImageUploadService', () => {
  it('should be importable', async () => {
    const { ImageUploadService } = await import('../services/image-upload');
    expect(ImageUploadService).toBeDefined();
    expect(typeof ImageUploadService.uploadImage).toBe('function');
    expect(typeof ImageUploadService.deleteImage).toBe('function');
  });

  it('should have correct interface', async () => {
    const { ImageUploadService } = await import('../services/image-upload');

    // Test that the service has the expected methods
    expect(ImageUploadService.uploadImage).toBeInstanceOf(Function);
    expect(ImageUploadService.deleteImage).toBeInstanceOf(Function);
  });
});
