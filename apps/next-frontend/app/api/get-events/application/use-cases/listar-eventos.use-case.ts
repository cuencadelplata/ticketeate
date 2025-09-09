import { EventoRepository } from '../../domain/repositories/evento.repository';
import { EventoEntity, EventoJson } from '../../domain/entities/evento.entity';
import { PaginacionVO, RespuestaPaginadaVO } from '../../domain/value-objects/paginacion.vo';
import { FiltrosEventosVO } from '../../domain/value-objects/filtros-eventos.vo';
import { ErrorBaseDatosException } from '../../domain/exceptions/evento.exceptions';

// DTO de entrada para el caso de uso
export interface ListarEventosInput {
  pagina?: string | number;
  limite?: string | number;
  filtros?: {
    fechaInicio?: string;
    fechaFin?: string;
    ubicacion?: string;
    categoriaId?: string;
    precioMin?: string | number;
    precioMax?: string | number;
  };
}

// DTO de salida para el caso de uso
export interface ListarEventosOutput {
  datos: EventoJson[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

/**
 * ===============================================================
 * CASO DE USO: LISTAR EVENTOS
 * ===============================================================
 *
 * PROPÓSITO:
 * Este caso de uso encapsula toda la lógica de negocio para obtener
 * una lista paginada de eventos con filtros opcionales.
 * Representa una funcionalidad específica del sistema.
 *
 * PATRÓN USE CASE:
 * - Encapsula una funcionalidad completa del sistema
 * - Input y Output bien definidos con DTOs
 * - Orquesta operaciones entre entidades y repositorios
 * - Contiene validaciones y transformaciones necesarias
 *
 * FLUJO DE EJECUCIÓN:
 * 1. Validar inputs del usuario
 * 2. Crear Value Objects (paginación, filtros)
 * 3. Consultar repositorio con parámetros validados
 * 4. Transformar entidades de dominio a DTOs de salida
 * 5. Retornar respuesta estructurada
 *
 * PARA EL EQUIPO:
 * - Este es el punto de entrada para listar eventos desde cualquier capa superior
 * - Modifica aquí si necesitas agregar lógica de negocio al listado
 * - Los DTOs permiten evolucionar la API sin afectar el dominio
 * - El manejo de errores está centralizado aquí
 *
 * TESTING:
 * - Mockea EventoRepository para unit tests
 * - Prueba diferentes combinaciones de filtros y paginación
 * - Verifica transformación correcta de entidades a JSON
 *
 * EXTENDING:
 * - Para nuevos filtros: modificar ListarEventosInput y lógica de filtros
 * - Para nueva funcionalidad: crear nuevo caso de uso
 *
 * @author Clean Architecture Implementation - Sistema de Eventos
 * @version 1.0.0
 * @since 2024-12-08
 * ===============================================================
 */
export class ListarEventosUseCase {
  constructor(private readonly eventoRepository: EventoRepository) {}

  async execute(input: ListarEventosInput): Promise<ListarEventosOutput> {
    try {
      // 1. Crear Value Objects desde los inputs
      const paginacionVO = PaginacionVO.crear(input.pagina, input.limite);

      // 2. Crear filtros si se proporcionan
      let filtrosVO: FiltrosEventosVO | undefined;
      if (input.filtros) {
        filtrosVO = new FiltrosEventosVO(
          input.filtros.fechaInicio ? new Date(input.filtros.fechaInicio) : undefined,
          input.filtros.fechaFin ? new Date(input.filtros.fechaFin) : undefined,
          input.filtros.ubicacion,
          input.filtros.categoriaId,
          input.filtros.precioMin ? Number(input.filtros.precioMin) : undefined,
          input.filtros.precioMax ? Number(input.filtros.precioMax) : undefined
        );
      }

      // 3. Ejecutar la consulta a través del repositorio
      const respuestaPaginada = await this.eventoRepository.buscarEventos(paginacionVO, filtrosVO);

      // 4. Convertir entidades de dominio a DTOs de salida
      const eventosJson = respuestaPaginada.datos.map(evento => evento.toJson());

      // 5. Retornar la respuesta estructurada
      return {
        datos: eventosJson,
        paginacion: respuestaPaginada.paginacion,
      };
    } catch (error) {
      // Manejo de errores con logging
      console.error('Error en ListarEventosUseCase:', error);

      if (error instanceof Error) {
        // Re-lanzar errores de dominio tal como están
        if (error.name.endsWith('Exception')) {
          throw error;
        }
        // Convertir errores genéricos a errores de dominio
        throw new ErrorBaseDatosException('listar eventos', error.message);
      }

      throw new ErrorBaseDatosException('listar eventos');
    }
  }

  /**
   * Método para validar los inputs del caso de uso
   */
  private validarInputs(input: ListarEventosInput): void {
    // Las validaciones específicas se delegan a los Value Objects
    // Aquí solo validaciones de alto nivel si fuera necesario

    if (input.filtros?.fechaInicio && input.filtros?.fechaFin) {
      const fechaInicio = new Date(input.filtros.fechaInicio);
      const fechaFin = new Date(input.filtros.fechaFin);

      if (isNaN(fechaInicio.getTime())) {
        throw new Error('Fecha de inicio inválida');
      }

      if (isNaN(fechaFin.getTime())) {
        throw new Error('Fecha de fin inválida');
      }
    }
  }
}
