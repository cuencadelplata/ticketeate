import { describe, it, expect, beforeEach } from 'vitest';

describe('Cloudinary Config', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });

  it('should export cloudinary instance', async () => {
    // Set environment variables
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';

    const cloudinary = await import('../config/cloudinary');

    expect(cloudinary.default).toBeDefined();
    expect(cloudinary.default.config).toBeDefined();
  });

  it('should handle missing environment variables', async () => {
    // Don't set environment variables
    const cloudinary = await import('../config/cloudinary');

    expect(cloudinary.default).toBeDefined();
    // Cloudinary should still be initialized even without env vars
  });
});
