import { prisma } from '../../../../packages/db/src';
import { listarEventos, obtenerDetalleEvento, calcularDisponibilidad } from '../apiEventos';

// Mock Prisma
jest.mock('../../../../packages/db/src', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    evento: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    reserva: {
      count: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('apiEventos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error para evitar logs en los tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Reset all mocks to ensure clean state
    mockPrisma.evento.findMany.mockReset();
    mockPrisma.evento.findUnique.mockReset();
    mockPrisma.evento.count.mockReset();
    mockPrisma.reserva.count.mockReset();
    // Clear mock implementations
    mockPrisma.evento.findMany.mockClear();
    mockPrisma.evento.findUnique.mockClear();
    mockPrisma.evento.count.mockClear();
    mockPrisma.reserva.count.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('listarEventos', () => {
    it('debería retornar lista de eventos paginada exitosamente', async () => {
      // Arrange
      const mockEventos = [
        {
          id: '1',
          titulo: 'Evento 1',
          descripcion: 'Descripción del evento 1',
          fechaInicio: new Date('2024-02-01'),
          fechaFin: new Date('2024-02-01'),
          ubicacion: 'Buenos Aires',
          precio: 100,
          capacidad: 50,
          disponibles: 50,
          estado: 'activo' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          categoria: { id: 'cat1', nombre: 'Concierto' },
          imagenes: [],
        },
      ];

      mockPrisma.evento.findMany.mockResolvedValue(mockEventos);
      mockPrisma.evento.count.mockResolvedValue(1);

      const paginacion = { pagina: 1, limite: 10 };

      // Act
      const resultado = await listarEventos(paginacion);

      // Assert
      expect(resultado).toEqual({
        datos: mockEventos,
        paginacion: {
          pagina: 1,
          limite: 10,
          total: 1,
          totalPaginas: 1,
        },
      });
      expect(mockPrisma.evento.findMany).toHaveBeenCalledWith({
        where: { estado: 'activo' },
        include: {
          categoria: true,
          imagenes: true,
        },
        skip: 0,
        take: 10,
        orderBy: {
          fechaInicio: 'asc',
        },
      });
      expect(mockPrisma.evento.count).toHaveBeenCalledWith({
        where: { estado: 'activo' },
      });
    });

    it('debería manejar paginación con valores por defecto', async () => {
      // Arrange
      const mockEventos = [
        {
          id: '1',
          titulo: 'Evento Default',
          descripcion: 'Evento con paginación por defecto',
          fechaInicio: new Date('2024-02-01'),
          fechaFin: new Date('2024-02-01'),
          ubicacion: 'Default Location',
          precio: 25,
          capacidad: 20,
          disponibles: 20,
          estado: 'activo' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          categoria: { id: 'default', nombre: 'Default' },
          imagenes: [],
        },
      ];

      mockPrisma.evento.findMany.mockResolvedValue(mockEventos);
      mockPrisma.evento.count.mockResolvedValue(1);

      // Act - sin especificar paginación
      const resultado = await listarEventos({ pagina: 1, limite: 10 });

      // Assert
      expect(resultado.datos).toEqual(mockEventos);
      expect(resultado.paginacion).toEqual({
        pagina: 1,
        limite: 10,
        total: 1,
        totalPaginas: 1,
      });
    });

    it('debería lanzar error cuando falla la consulta a base de datos', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockPrisma.evento.findMany.mockRejectedValue(error);

      const paginacion = { pagina: 1, limite: 10 };

      // Act & Assert
      await expect(listarEventos(paginacion)).rejects.toThrow(
        'Error interno del servidor al obtener eventos'
      );
      expect(console.error).toHaveBeenCalledWith('Error al listar eventos:', error);
    });

    it('debería aplicar filtros de fecha correctamente', async () => {
      // Arrange
      const mockEventos = [
        {
          id: '1',
          titulo: 'Evento Filtrado por Fecha',
          descripcion: 'Evento dentro del rango de fechas',
          fechaInicio: new Date('2024-02-15'),
          fechaFin: new Date('2024-02-16'),
          ubicacion: 'Buenos Aires',
          precio: 50,
          capacidad: 25,
          disponibles: 25,
          estado: 'activo' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          categoria: { id: 'fecha', nombre: 'Fecha' },
          imagenes: [],
        },
      ];

      mockPrisma.evento.findMany.mockResolvedValue(mockEventos);
      mockPrisma.evento.count.mockResolvedValue(1);

      const paginacion = { pagina: 1, limite: 10 };
      const filtros = {
        fechaInicio: new Date('2024-02-10'),
        fechaFin: new Date('2024-02-20'),
      };

      // Act
      const resultado = await listarEventos(paginacion, filtros);

      // Assert
      expect(resultado.datos).toEqual(mockEventos);
      expect(mockPrisma.evento.findMany).toHaveBeenCalledWith({
        where: {
          estado: 'activo',
          fechaInicio: {
            gte: filtros.fechaInicio,
          },
          fechaFin: {
            lte: filtros.fechaFin,
          },
        },
        include: {
          categoria: true,
          imagenes: true,
        },
        skip: 0,
        take: 10,
        orderBy: {
          fechaInicio: 'asc',
        },
      });
    });

    it('debería aplicar filtros de precio correctamente', async () => {
      // Arrange
      const mockEventos = [
        {
          id: '1',
          titulo: 'Evento de Precio Medio',
          descripcion: 'Evento en rango de precio especificado',
          fechaInicio: new Date('2024-03-01'),
          fechaFin: new Date('2024-03-01'),
          ubicacion: 'Córdoba',
          precio: 75,
          capacidad: 30,
          disponibles: 30,
          estado: 'activo' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          categoria: { id: 'precio', nombre: 'Precio' },
          imagenes: [],
        },
      ];

      mockPrisma.evento.findMany.mockResolvedValue(mockEventos);
      mockPrisma.evento.count.mockResolvedValue(1);

      const paginacion = { pagina: 1, limite: 10 };
      const filtros = {
        precioMin: 50,
        precioMax: 100,
      };

      // Act
      const resultado = await listarEventos(paginacion, filtros);

      // Assert
      expect(resultado.datos).toEqual(mockEventos);
      expect(mockPrisma.evento.findMany).toHaveBeenCalledWith({
        where: {
          estado: 'activo',
          precio: {
            gte: 50,
            lte: 100,
          },
        },
        include: {
          categoria: true,
          imagenes: true,
        },
        skip: 0,
        take: 10,
        orderBy: {
          fechaInicio: 'asc',
        },
      });
    });

    describe('obtenerDetalleEvento', () => {
      it('debería retornar detalle de evento específico exitosamente', async () => {
        // Arrange
        const eventoId = 'evento123';
        const mockEvento = {
          id: eventoId,
          titulo: 'Evento Detalle',
          descripcion: 'Descripción completa del evento',
          fechaInicio: new Date('2024-03-01'),
          fechaFin: new Date('2024-03-01'),
          ubicacion: 'Centro Cultural',
          precio: 200,
          capacidad: 100,
          disponibles: 100,
          estado: 'activo' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          categoria: { id: 'cat3', nombre: 'Festival' },
          imagenes: [
            { id: 'img1', url: '/imagen1.jpg', alt: 'Imagen principal', esPrincipal: true },
            { id: 'img2', url: '/imagen2.jpg', alt: 'Imagen secundaria', esPrincipal: false },
          ],
        };

        mockPrisma.evento.findUnique.mockResolvedValue(mockEvento);
        mockPrisma.reserva.count.mockResolvedValue(20); // 20 reservas confirmadas

        // Act
        const resultado = await obtenerDetalleEvento(eventoId);

        // Assert
        expect(resultado).toEqual({
          ...mockEvento,
          disponibles: 80, // 100 capacidad - 20 reservas = 80 disponibles
        });
        expect(mockPrisma.evento.findUnique).toHaveBeenCalledWith({
          where: {
            id: eventoId,
            estado: 'activo',
          },
          include: {
            categoria: true,
            imagenes: {
              orderBy: {
                esPrincipal: 'desc',
              },
            },
          },
        });
        expect(mockPrisma.reserva.count).toHaveBeenCalledWith({
          where: {
            eventoId: eventoId,
            estado: 'confirmada',
          },
        });
      });

      it('debería lanzar error cuando evento no existe en obtenerDetalleEvento', async () => {
        // Arrange
        const eventoId = 'evento-inexistente';
        mockPrisma.evento.findUnique.mockResolvedValue(null);

        // Act & Assert
        await expect(obtenerDetalleEvento(eventoId)).rejects.toThrow(
          'Evento no encontrado o no disponible'
        );
        expect(mockPrisma.evento.findUnique).toHaveBeenCalledWith({
          where: {
            id: eventoId,
            estado: 'activo',
          },
          include: {
            categoria: true,
            imagenes: {
              orderBy: {
                esPrincipal: 'desc',
              },
            },
          },
        });
      });
    });

    describe('calcularDisponibilidad', () => {
      it('debería calcular disponibilidad correctamente', async () => {
        // Arrange
        const eventoId = 'evento456';
        const capacidad = 50;
        const reservasConfirmadas = 15;

        mockPrisma.evento.findUnique.mockResolvedValueOnce({
          id: eventoId,
          capacidad: capacidad,
        });
        mockPrisma.reserva.count.mockResolvedValueOnce(reservasConfirmadas);

        // Act
        const resultado = await calcularDisponibilidad(eventoId);

        // Assert
        expect(resultado).toBe(35); // 50 - 15 = 35
        expect(mockPrisma.evento.findUnique).toHaveBeenCalledWith({
          where: { id: eventoId },
          select: { capacidad: true },
        });
        expect(mockPrisma.reserva.count).toHaveBeenCalledWith({
          where: {
            eventoId: eventoId,
            estado: 'confirmada',
          },
        });
      });

      it('debería manejar errores de base de datos en calcularDisponibilidad', async () => {
        // Arrange
        const eventoId = 'evento-error';
        const error = new Error('Database connection error');
        mockPrisma.evento.findUnique.mockRejectedValueOnce(error);

        // Act
        const resultado = await calcularDisponibilidad(eventoId);

        // Assert
        expect(resultado).toBe(0);
        expect(mockPrisma.evento.findUnique).toHaveBeenCalledWith({
          where: { id: eventoId },
          select: { capacidad: true },
        });
        expect(console.error).toHaveBeenCalledWith('Error al calcular disponibilidad:', error);
      });

      it('debería retornar 0 cuando hay más reservas que capacidad', async () => {
        // Arrange
        const eventoId = 'evento789';
        const capacidad = 10;
        const reservasConfirmadas = 15; // Más reservas que capacidad

        mockPrisma.evento.findUnique.mockResolvedValueOnce({
          id: eventoId,
          capacidad: capacidad,
        });
        mockPrisma.reserva.count.mockResolvedValueOnce(reservasConfirmadas);

        // Act
        const resultado = await calcularDisponibilidad(eventoId);

        // Assert
        expect(resultado).toBe(0); // Math.max(0, 10 - 15) = 0
      });
    });
  });
});
