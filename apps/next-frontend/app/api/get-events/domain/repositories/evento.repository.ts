import { EventoEntity } from '../entities/evento.entity';
import { PaginacionVO, RespuestaPaginadaVO } from '../value-objects/paginacion.vo';
import { FiltrosEventosVO } from '../value-objects/filtros-eventos.vo';

/**
 * ===============================================================
 * INTERFACE REPOSITORY - EVENTOS
 * ===============================================================
 * 
 * PROPÓSITO:
 * Este archivo define el contrato (interface) que debe cumplir
 * cualquier implementación de persistencia de eventos.
 * Representa el "puerto de salida" en Arquitectura Hexagonal.
 * 
 * PATRÓN REPOSITORY:
 * - Abstrae el acceso a datos del dominio
 * - Permite intercambiar implementaciones (Prisma, MongoDB, etc.)
 * - El dominio no conoce detalles de persistencia
 * 
 * MÉTODO INVERSIÓN DE DEPENDENCIAS:
 * - El dominio define QUÉ necesita (esta interface)
 * - La infraestructura implementa CÓMO lo hace (PrismaEventoRepository)
 * - El dominio no depende de la implementación concreta
 * 
 * PARA EL EQUIPO:
 * - Si necesitas nuevas operaciones de BD, agrégalas aquí primero
 * - Luego implementa en PrismaEventoRepository
 * - Mantén métodos enfocados en el dominio, no en tecnología
 * - Usa tipos del dominio (EventoEntity), no de Prisma
 * 
 * EJEMPLO DE NUEVA OPERACIÓN:
 * ```typescript
 * interface EventoRepository {
 *   buscarPorCategoria(categoriaId: string): Promise<EventoEntity[]>;
 * }
 * ```
 * 
 * TESTING:
 * - Puedes crear mocks implementando esta interface
 * - Útil para unit tests de casos de uso
 * 
 * @author Clean Architecture Implementation - Sistema de Eventos
 * @version 1.0.0
 * @since 2024-12-08
 * ===============================================================
 */
export interface EventoRepository {
  /**
   * Busca eventos con paginación y filtros opcionales
   * @param paginacion Parámetros de paginación
   * @param filtros Filtros opcionales para la búsqueda
   * @returns Promise con la respuesta paginada de eventos
   */
  buscarEventos(
    paginacion: PaginacionVO,
    filtros?: FiltrosEventosVO
  ): Promise<RespuestaPaginadaVO<EventoEntity>>;

  /**
   * Busca un evento por su ID
   * @param id ID del evento
   * @returns Promise con el evento encontrado o null
   */
  buscarPorId(id: string): Promise<EventoEntity | null>;

  /**
   * Calcula la disponibilidad de un evento específico
   * @param eventoId ID del evento
   * @returns Promise con el número de entradas disponibles
   */
  calcularDisponibilidad(eventoId: string): Promise<number>;

  /**
   * Verifica si un evento existe y está activo
   * @param eventoId ID del evento
   * @returns Promise con boolean indicando si existe y está activo
   */
  existeYEstaActivo(eventoId: string): Promise<boolean>;
}
