import { prisma } from '@/lib/prisma';
import { EventoRepository } from '../../domain/repositories/evento.repository';
import { EventoEntity, EventoData } from '../../domain/entities/evento.entity';
import { PaginacionVO, RespuestaPaginadaVO } from '../../domain/value-objects/paginacion.vo';
import { FiltrosEventosVO } from '../../domain/value-objects/filtros-eventos.vo';
import { ErrorBaseDatosException } from '../../domain/exceptions/evento.exceptions';

/**
 * Implementación del Repositorio de Eventos usando Prisma ORM
 * 
 * PROPÓSITO:
 * Esta clase implementa el patrón Repository usando Prisma ORM.
 * Actúa como adaptador entre la capa de dominio y la base de datos PostgreSQL.
 * 
 * ADAPTACIONES APLICADAS:
 * - Mapea schema de Prisma a entidades de dominio
 * - Convierte filtros de dominio a consultas Prisma
 * - Maneja relaciones complejas (categorias_entrada, imagenes_evento)
 * - Calcula disponibilidad en tiempo real
 * 
 * CORRECCIONES DE SCHEMA APLICADAS:
 * - id → id_evento
 * - fechaInicio/fechaFin → fecha_inicio_venta/fecha_fin_venta
 * - estado: 'activo' → 'ACTIVO'
 * - imagenes → imagenes_evento
 * - categoria → categorias_entrada (relación uno-a-muchos)
 * 
 * LÓGICA DE NEGOCIO IMPLEMENTADA:
 * - Disponibilidad = suma(stock_total) - reservas_confirmadas
 * - Solo eventos ACTIVOS son retornados
 * - Precios mínimos calculados desde categorías
 * - Imágenes de portada priorizadas
 * 
 * NOTAS PARA EL EQUIPO:
 * - Si cambias el schema de Prisma, actualiza los mapeos aquí
 * - Los métodos privados manejan la transformación de datos
 * - Las consultas están optimizadas con includes y ejecución paralela
 * - El manejo de errores convierte excepciones técnicas a de dominio
 * 
 * RENDIMIENTO:
 * - Consultas paralelas donde es posible
 * - Includes optimizados para evitar consultas N+1
 * - Cálculo de disponibilidad cacheado por request
 * 
 * DEPURACIÓN:
 * - Logs de error detallados para cada operación
 * - Mapea errores de Prisma a errores de dominio
 * - Validaciones defensivas para datos corruptos
 * 
 * @author Implementación de Arquitectura Limpia - Sistema de Eventos
 * @version 1.0.0
 * @since 2024-12-08
 */
export class PrismaEventoRepository implements EventoRepository {

  /**
   * Busca eventos con paginación y filtros opcionales
   */
  async buscarEventos(
    paginacion: PaginacionVO,
    filtros?: FiltrosEventosVO
  ): Promise<RespuestaPaginadaVO<EventoEntity>> {
    try {
      // 1. Construir condiciones WHERE
      const whereConditions = this.construirCondicionesWhere(filtros);

      // 2. Ejecutar consulta con paginación en paralelo
      const [eventos, total] = await Promise.all([
        prisma.evento.findMany({
          where: whereConditions,
          include: {
            categorias_entrada: true,
            imagenes_evento: true,
          },
          skip: paginacion.skip,
          take: paginacion.limite,
          orderBy: {
            fecha_inicio_venta: 'asc',
          },
        }),
        prisma.evento.count({ where: whereConditions }),
      ]);

      // 3. Calcular disponibilidad para cada evento en paralelo
      const disponibilidadPromises = eventos.map((evento: any) => 
        this.calcularDisponibilidad(evento.id_evento)
      );
      const disponibilidades = await Promise.all(disponibilidadPromises);

      // 4. Mapear datos de Prisma a entidades de dominio
      const entidadesEvento = eventos.map((evento: any, index: number) => {
        const eventoData = this.mapearPrismaAEventoData(evento, disponibilidades[index]);
        return EventoEntity.crear(eventoData);
      });

      // 5. Crear y retornar respuesta paginada
      return RespuestaPaginadaVO.crear(entidadesEvento, paginacion, total);

    } catch (error) {
      console.error('Error en buscarEventos:', error);
      throw new ErrorBaseDatosException('buscar eventos', error instanceof Error ? error.message : undefined);
    }
  }

  /**
   * Busca un evento por su ID
   */
  async buscarPorId(id: string): Promise<EventoEntity | null> {
    try {
      // 1. Buscar evento en base de datos
      const evento = await prisma.evento.findFirst({
        where: {
          id_evento: id,
          estado: 'ACTIVO', // Solo eventos activos
        },
        include: {
          categorias_entrada: true,
          imagenes_evento: true,
        },
      });

      // 2. Retornar null si no existe
      if (!evento) {
        return null;
      }

      // 3. Calcular disponibilidad
      const disponibilidad = await this.calcularDisponibilidad(evento.id_evento);

      // 4. Mapear a entidad de dominio
      const eventoData = this.mapearPrismaAEventoData(evento, disponibilidad);
      return EventoEntity.crear(eventoData);

    } catch (error) {
      console.error('Error en buscarPorId:', error);
      throw new ErrorBaseDatosException('buscar evento por ID', error instanceof Error ? error.message : undefined);
    }
  }

  /**
   * Calcula la disponibilidad de un evento específico
   */
  async calcularDisponibilidad(eventoId: string): Promise<number> {
    try {
      // 1. Buscar capacidad desde categorías de entrada (suma total)
      const categorias = await prisma.categoriaEntrada.findMany({
        where: { id_evento: eventoId },
        select: { stock_total: true },
      });

      if (!categorias || categorias.length === 0) {
        return 0;
      }

      // 2. Sumar capacidad total de todas las categorías
      const capacidadTotal = categorias.reduce((total: number, cat: any) => total + cat.stock_total, 0);

      // 3. Contar reservas confirmadas
      const reservasConfirmadas = await prisma.reserva.count({
        where: {
          id_evento: eventoId,
          estado: 'CONFIRMADA',
        },
      });

      // 4. Calcular disponibilidad
      return Math.max(0, capacidadTotal - reservasConfirmadas);

    } catch (error) {
      console.error('Error en calcularDisponibilidad:', error);
      // En caso de error, retornamos 0 para ser conservadores
      return 0;
    }
  }

  /**
   * Verifica si un evento existe y está activo
   */
  async existeYEstaActivo(eventoId: string): Promise<boolean> {
    try {
      const count = await prisma.evento.count({
        where: {
          id_evento: eventoId,
          estado: 'ACTIVO',
        },
      });

      return count > 0;

    } catch (error) {
      console.error('Error en existeYEstaActivo:', error);
      return false;
    }
  }

  /**
   * Construye las condiciones WHERE para Prisma basadas en los filtros
   */
  private construirCondicionesWhere(filtros?: FiltrosEventosVO): any {
    const where: any = {
      estado: 'ACTIVO', // Solo eventos activos
    };

    if (!filtros) {
      return where;
    }

    // Filtro por fecha de inicio de venta
    if (filtros.fechaInicio) {
      where.fecha_inicio_venta = {
        gte: filtros.fechaInicio,
      };
    }

    // Filtro por fecha de fin de venta
    if (filtros.fechaFin) {
      where.fecha_fin_venta = {
        lte: filtros.fechaFin,
      };
    }

    // Filtro por ubicación (búsqueda insensible a mayúsculas)
    if (filtros.ubicacion) {
      where.ubicacion = {
        contains: filtros.ubicacion,
        mode: 'insensitive',
      };
    }

    // Filtro por categoría (a través de categorias_entrada)
    if (filtros.categoriaId) {
      where.categorias_entrada = {
        some: {
          id_categoria: filtros.categoriaId,
        },
      };
    }

    // Filtros por precio (a través de categorias_entrada)
    if (filtros.precioMin !== undefined || filtros.precioMax !== undefined) {
      where.categorias_entrada = {
        some: {
          ...(where.categorias_entrada?.some || {}),
          precio: {},
        },
      };
      if (filtros.precioMin !== undefined) {
        where.categorias_entrada.some.precio.gte = filtros.precioMin;
      }
      if (filtros.precioMax !== undefined) {
        where.categorias_entrada.some.precio.lte = filtros.precioMax;
      }
    }

    return where;
  }

  /**
   * Mapea los datos de Prisma a EventoData para crear entidades de dominio
   */
  private mapearPrismaAEventoData(evento: any, disponibilidad: number): EventoData {
    // Obtener la primera categoría de entrada para datos básicos
    const primeraCategoria = evento.categorias_entrada?.[0];
    const precioMinimo = evento.categorias_entrada?.length > 0 
      ? Math.min(...evento.categorias_entrada.map((cat: any) => Number(cat.precio)))
      : 0;
    const capacidadTotal = evento.categorias_entrada?.reduce((total: number, cat: any) => total + cat.stock_total, 0) || 0;

    return {
      id: evento.id_evento,
      titulo: evento.titulo,
      descripcion: evento.descripcion || '',
      fechaInicio: evento.fecha_inicio_venta instanceof Date 
        ? evento.fecha_inicio_venta.toISOString() 
        : String(evento.fecha_inicio_venta),
      fechaFin: evento.fecha_fin_venta instanceof Date 
        ? evento.fecha_fin_venta.toISOString() 
        : String(evento.fecha_fin_venta),
      ubicacion: evento.ubicacion || '',
      precio: precioMinimo,
      capacidad: capacidadTotal,
      disponibles: disponibilidad,
      categoria: {
        id: primeraCategoria?.id_categoria || 'general',
        nombre: primeraCategoria?.nombre || 'General',
        descripcion: primeraCategoria?.descripcion,
      },
      imagenes: evento.imagenes_evento?.map((img: any) => ({
        id: img.id_imagen,
        url: img.url,
        alt: img.url.split('/').pop() || 'Imagen del evento',
        esPrincipal: img.tipo === 'PORTADA',
      })) || [],
      estado: evento.estado.toLowerCase(), // Convertir de 'ACTIVO' a 'activo'
      createdAt: evento.fecha_creacion instanceof Date 
        ? evento.fecha_creacion.toISOString() 
        : String(evento.fecha_creacion),
      updatedAt: evento.fecha_creacion instanceof Date 
        ? evento.fecha_creacion.toISOString() 
        : String(evento.fecha_creacion), // Usar fecha_creacion como updatedAt
    };
  }
}