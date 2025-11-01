import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de Cloudinary usando vi.hoisted para evitar problemas de hoisting
const mockCloudinary = vi.hoisted(() => ({
  config: vi.fn(),
}));

vi.mock('cloudinary', () => ({
  v2: mockCloudinary,
}));

import cloudinary from '../config/cloudinary';

describe('Cloudinary Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export cloudinary instance', () => {
    expect(cloudinary).toBe(mockCloudinary);
  });

  it('should have config method', () => {
    expect(mockCloudinary.config).toBeDefined();
    expect(typeof mockCloudinary.config).toBe('function');
  });
});
