// Setup global test configuration
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

beforeAll(() => {
  // Setup before all tests
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Cleanup after all tests
});

beforeEach(() => {
  // Reset before each test
});

afterEach(() => {
  // Cleanup after each test
});
