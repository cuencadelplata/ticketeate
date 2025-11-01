import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
const originalEnv = process.env;

describe('Cloudinary Config', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should configure cloudinary with environment variables', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';

    // Mock cloudinary
    const mockCloudinary = {
      config: vi.fn(),
    };

    vi.doMock('cloudinary', () => ({
      v2: mockCloudinary,
    }));

    // Import after mocking
    const cloudinaryModule = await import('../config/cloudinary.js');

    expect(mockCloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    });

    expect(cloudinaryModule.default).toBe(mockCloudinary);
  });

  it('should handle missing environment variables', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const mockCloudinary = {
      config: vi.fn(),
    };

    vi.doMock('cloudinary', () => ({
      v2: mockCloudinary,
    }));

    await import('../config/cloudinary.js');

    expect(mockCloudinary.config).toHaveBeenCalledWith({
      cloud_name: undefined,
      api_key: undefined,
      api_secret: undefined,
    });
  });
});
