import '@testing-library/jest-dom';

// Mock Prisma client
jest.mock('../../packages/db/src', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));
