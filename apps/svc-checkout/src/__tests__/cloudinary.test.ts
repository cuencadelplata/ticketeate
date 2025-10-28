import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock de Cloudinary usando vi.hoisted para evitar problemas de hoisting
const mockCloudinary = vi.hoisted(() => ({
  config: vi.fn(),
}));

vi.mock('cloudinary', () => ({
  v2: mockCloudinary,
}));

describe('Cloudinary Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules(); // Reset module cache
    // Limpiar variables de entorno
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });

  afterEach(() => {
    vi.resetModules(); // Reset module cache after each test
  });

  it('should configure Cloudinary with environment variables', async () => {
    // Establecer variables de entorno
    process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
    process.env.CLOUDINARY_API_KEY = 'test-key';
    process.env.CLOUDINARY_API_SECRET = 'test-secret';

    // Re-importar el módulo para que use las nuevas variables de entorno
    await import('../config/cloudinary');

    expect(mockCloudinary.config).toHaveBeenCalledWith({
      cloud_name: 'test-cloud',
      api_key: 'test-key',
      api_secret: 'test-secret',
    });
  });

  it('should handle missing environment variables', async () => {
    // No establecer variables de entorno
    await import('../config/cloudinary');

    expect(mockCloudinary.config).toHaveBeenCalledWith({
      cloud_name: undefined,
      api_key: undefined,
      api_secret: undefined,
    });
  });

  it('should export cloudinary instance', async () => {
    const cloudinaryModule = await import('../config/cloudinary');

    expect(cloudinaryModule.default).toBe(mockCloudinary);
  });
});
