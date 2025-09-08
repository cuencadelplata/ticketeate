import { EventoRepository } from '../../domain/repositories/evento.repository';
import { EventoEntity, EventoData } from '../../domain/entities/evento.entity';
import { PaginacionVO, RespuestaPaginadaVO } from '../../domain/value-objects/paginacion.vo';
import { FiltrosEventosVO } from '../../domain/value-objects/filtros-eventos.vo';

/**
 * Implementación Mock del Repositorio de Eventos
 * 
 * PROPÓSITO:
 * Implementación temporal usando datos mock para probar Arquitectura Limpia
 * sin dependencias de base de datos. Esto permite probar todas las capas
 * arquitectónicas mientras se resuelven problemas de Prisma Client por separado.
 * 
 * NOTAS PARA EL EQUIPO:
 * - Esta es una implementación TEMPORAL para propósitos de testing
 * - Reemplazar con PrismaEventoRepository una vez resueltos los problemas de Prisma
 * - Contiene datos mock realistas que coinciden con la estructura del schema
 * - Simula todas las operaciones del repositorio correctamente
 */
export class MockEventoRepository implements EventoRepository {

  private mockEventos: EventoData[] = [
    {
      id: 'cmf20i5j60004u6ust32p9570',
      titulo: 'Concierto de Rock Nacional',
      descripcion: 'Una noche increíble con las mejores bandas de rock nacional. Ven y disfruta de la música en vivo en un ambiente espectacular.',
      fechaInicio: '2025-01-15T20:00:00.000Z',
      fechaFin: '2025-01-15T23:30:00.000Z',
      ubicacion: 'Teatro Gran Rex, Buenos Aires',
      precio: 15000,
      capacidad: 500,
      disponibles: 150,
      categoria: {
        id: 'cat_music_rock',
        nombre: 'Rock Nacional',
        descripcion: 'Eventos de rock y música nacional'
      },
      imagenes: [
        {
          id: 'img1',
          url: 'https://example.com/rock-concert.jpg',
          alt: 'Concierto de Rock Nacional',
          esPrincipal: true
        }
      ],
      estado: 'activo',
      createdAt: '2024-12-01T10:00:00.000Z',
      updatedAt: '2024-12-05T15:30:00.000Z'
    },
    {
      id: 'cmf20i3u20001u6us8gwtsldy',
      titulo: 'Obra de Teatro Clásica',
      descripcion: 'Una representación magistral de una obra clásica del teatro argentino.',
      fechaInicio: '2025-02-20T19:00:00.000Z',
      fechaFin: '2025-02-20T21:00:00.000Z',
      ubicacion: 'Teatro Colón, Buenos Aires',
      precio: 25000,
      capacidad: 300,
      disponibles: 80,
      categoria: {
        id: 'cat_teatro',
        nombre: 'Teatro',
        descripcion: 'Obras teatrales y dramáticas'
      },
      imagenes: [
        {
          id: 'img2',
          url: 'https://example.com/teatro.jpg',
          alt: 'Obra de Teatro Clásica',
          esPrincipal: true
        }
      ],
      estado: 'activo',
      createdAt: '2024-12-02T14:20:00.000Z',
      updatedAt: '2024-12-06T09:15:00.000Z'
    },
    {
      id: 'cmf20i7x30005u6us9hxvmn12',
      titulo: 'Festival de Jazz',
      descripcion: 'Un festival único con los mejores exponentes del jazz internacional.',
      fechaInicio: '2025-03-10T18:00:00.000Z',
      fechaFin: '2025-03-10T22:00:00.000Z',
      ubicacion: 'Centro Cultural Recoleta, Buenos Aires',
      precio: 18000,
      capacidad: 400,
      disponibles: 220,
      categoria: {
        id: 'cat_music_jazz',
        nombre: 'Jazz',
        descripcion: 'Eventos de jazz y música instrumental'
      },
      imagenes: [],
      estado: 'activo',
      createdAt: '2024-12-03T11:45:00.000Z',
      updatedAt: '2024-12-07T16:20:00.000Z'
    }
  ];

  async buscarEventos(
    paginacion: PaginacionVO,
    filtros?: FiltrosEventosVO
  ): Promise<RespuestaPaginadaVO<EventoEntity>> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let eventosFiltrados = this.mockEventos;
    
    // Apply filters
    if (filtros) {
      eventosFiltrados = this.aplicarFiltros(eventosFiltrados, filtros);
    }
    
    // Apply pagination
    const start = paginacion.skip;
    const end = start + paginacion.limite;
    const eventosPaginados = eventosFiltrados.slice(start, end);
    
    // Convert to domain entities
    const entidades = eventosPaginados.map(data => EventoEntity.crear(data));
    
    return RespuestaPaginadaVO.crear(entidades, paginacion, eventosFiltrados.length);
  }

  async buscarPorId(id: string): Promise<EventoEntity | null> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const eventoData = this.mockEventos.find(evento => evento.id === id);
    
    if (!eventoData) {
      return null;
    }
    
    return EventoEntity.crear(eventoData);
  }

  async calcularDisponibilidad(eventoId: string): Promise<number> {
    // Simulate async operation  
    await new Promise(resolve => setTimeout(resolve, 20));
    
    const evento = this.mockEventos.find(e => e.id === eventoId);
    return evento?.disponibles || 0;
  }

  async existeYEstaActivo(eventoId: string): Promise<boolean> {
    const evento = this.mockEventos.find(e => e.id === eventoId);
    return !!(evento && evento.estado === 'activo');
  }

  private aplicarFiltros(eventos: EventoData[], filtros: FiltrosEventosVO): EventoData[] {
    return eventos.filter(evento => {
      // Filter by ubicacion
      if (filtros.ubicacion) {
        const matchUbicacion = evento.ubicacion.toLowerCase().includes(filtros.ubicacion.toLowerCase());
        if (!matchUbicacion) return false;
      }
      
      // Filter by categoria
      if (filtros.categoriaId) {
        if (evento.categoria.id !== filtros.categoriaId) return false;
      }
      
      // Filter by precio
      if (filtros.precioMin !== undefined && evento.precio < filtros.precioMin) {
        return false;
      }
      if (filtros.precioMax !== undefined && evento.precio > filtros.precioMax) {
        return false;
      }
      
      // Filter by fechas
      if (filtros.fechaInicio) {
        const eventoFecha = new Date(evento.fechaInicio);
        if (eventoFecha < filtros.fechaInicio) return false;
      }
      if (filtros.fechaFin) {
        const eventoFecha = new Date(evento.fechaFin);
        if (eventoFecha > filtros.fechaFin) return false;
      }
      
      return true;
    });
  }
}
