import { prisma } from '../../../../packages/db/src';
import { fetchEventos, fetchEventoById, createEvento } from '../apiEventos';

// Mock Prisma
jest.mock('../../../../packages/db/src', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('apiEventos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error para evitar logs en los tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchEventos', () => {
    it('debería retornar una lista de eventos exitosamente', async () => {
      // Arrange
      const mockEventos = [
        {
          id: '1',
          email: 'test1@example.com',
          name: 'Usuario 1',
          posts: [],
        },
        {
          id: '2',
          email: 'test2@example.com',
          name: 'Usuario 2',
          posts: [],
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockEventos);

      // Act
      const resultado = await fetchEventos();

      // Assert
      expect(resultado).toEqual(mockEventos);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        include: {
          posts: true,
        },
      });
      expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar un error cuando Prisma falla', async () => {
      // Arrange
      const mockError = new Error('Error de base de datos');
      mockPrisma.user.findMany.mockRejectedValue(mockError);

      // Act & Assert
      await expect(fetchEventos()).rejects.toThrow('Error de base de datos');
      expect(console.error).toHaveBeenCalledWith('Error al obtener eventos:', mockError);
    });
  });

  describe('fetchEventoById', () => {
    it('debería retornar un evento específico por ID', async () => {
      // Arrange
      const eventoId = '123';
      const mockEvento = {
        id: eventoId,
        email: 'test@example.com',
        name: 'Usuario Test',
        posts: [],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockEvento);

      // Act
      const resultado = await fetchEventoById(eventoId);

      // Assert
      expect(resultado).toEqual(mockEvento);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: eventoId,
        },
        include: {
          posts: true,
        },
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('debería retornar null cuando no encuentra el evento', async () => {
      // Arrange
      const eventoId = '999';
      mockPrisma.user.findUnique.mockResolvedValue(null);

      // Act
      const resultado = await fetchEventoById(eventoId);

      // Assert
      expect(resultado).toBeNull();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: eventoId,
        },
        include: {
          posts: true,
        },
      });
    });

    it('debería lanzar un error cuando Prisma falla', async () => {
      // Arrange
      const eventoId = '123';
      const mockError = new Error('Error de conexión');
      mockPrisma.user.findUnique.mockRejectedValue(mockError);

      // Act & Assert
      await expect(fetchEventoById(eventoId)).rejects.toThrow('Error de conexión');
      expect(console.error).toHaveBeenCalledWith('Error al obtener evento por ID:', mockError);
    });
  });

  describe('createEvento', () => {
    it('debería crear un nuevo evento exitosamente', async () => {
      // Arrange
      const eventData = {
        email: 'nuevo@example.com',
        name: 'Nuevo Usuario',
      };

      const mockEventoCreado = {
        id: '456',
        email: eventData.email,
        name: eventData.name,
      };

      mockPrisma.user.create.mockResolvedValue(mockEventoCreado);

      // Act
      const resultado = await createEvento(eventData);

      // Assert
      expect(resultado).toEqual(mockEventoCreado);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: eventData.email,
          name: eventData.name,
        },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('debería crear un evento sin nombre cuando no se proporciona', async () => {
      // Arrange
      const eventData = {
        email: 'sin-nombre@example.com',
      };

      const mockEventoCreado = {
        id: '789',
        email: eventData.email,
        name: null,
      };

      mockPrisma.user.create.mockResolvedValue(mockEventoCreado);

      // Act
      const resultado = await createEvento(eventData);

      // Assert
      expect(resultado).toEqual(mockEventoCreado);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: eventData.email,
          name: undefined,
        },
      });
    });

    it('debería lanzar un error cuando Prisma falla al crear', async () => {
      // Arrange
      const eventData = {
        email: 'error@example.com',
        name: 'Error Test',
      };

      const mockError = new Error('Error de validación');
      mockPrisma.user.create.mockRejectedValue(mockError);

      // Act & Assert
      await expect(createEvento(eventData)).rejects.toThrow('Error de validación');
      expect(console.error).toHaveBeenCalledWith('Error al crear evento:', mockError);
    });

    it('debería manejar errores de email duplicado', async () => {
      // Arrange
      const eventData = {
        email: 'duplicado@example.com',
        name: 'Usuario Duplicado',
      };

      const mockError = new Error('Unique constraint failed on the field: email');
      mockPrisma.user.create.mockRejectedValue(mockError);

      // Act & Assert
      await expect(createEvento(eventData)).rejects.toThrow(
        'Unique constraint failed on the field: email'
      );
      expect(console.error).toHaveBeenCalledWith('Error al crear evento:', mockError);
    });
  });
});
