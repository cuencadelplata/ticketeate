import { EventoRepository } from '../../domain/repositories/evento.repository';
import { EventoEntity, EventoJson } from '../../domain/entities/evento.entity';
import {
  EventoNoEncontradoException,
  ErrorBaseDatosException,
  ParametroInvalidoException,
} from '../../domain/exceptions/evento.exceptions';

// DTO de entrada para el caso de uso
export interface ObtenerEventoInput {
  id: string;
}

// DTO de salida para el caso de uso
export interface ObtenerEventoOutput {
  evento: EventoJson;
}

/**
 * ===============================================================
 * CASO DE USO: OBTENER EVENTO POR ID
 * ===============================================================
 *
 * PROPÓSITO:
 * Este caso de uso maneja la lógica de negocio para obtener
 * el detalle completo de un evento específico por su ID.
 *
 * VALIDACIONES INCLUIDAS:
 * - ID requerido y formato válido
 * - Evento debe existir y estar activo
 * - Validaciones de dominio aplicadas
 *
 * FLUJO DE EJECUCIÓN:
 * 1. Validar formato y presencia del ID
 * 2. Buscar evento en repositorio
 * 3. Verificar que existe y está activo
 * 4. Aplicar reglas de dominio adicionales
 * 5. Transformar a DTO de respuesta
 *
 * SEGURIDAD:
 * - No revela información sobre eventos inactivos
 * - Validación estricta de parámetros de entrada
 * - Manejo consistente de errores
 *
 * PARA EL EQUIPO:
 * - Usa este caso de uso para obtener detalles de eventos individuales
 * - Las validaciones están centralizadas aquí
 * - Manejo de errores específico para casos de uso
 * - Fácil de testear y modificar independientemente
 *
 * EJEMPLO DE USO:
 * ```typescript
 * const resultado = await obtenerEventoUseCase.execute({ id: 'evento-123' });
 * console.log(resultado.evento.titulo);
 * ```
 *
 * ERROR HANDLING:
 * - EventoNoEncontradoException: Evento no existe o inactivo
 * - ParametroInvalidoException: ID inválido o vacío
 * - ErrorBaseDatosException: Error técnico de base de datos
 *
 * @author Clean Architecture Implementation - Sistema de Eventos
 * @version 1.0.0
 * @since 2024-12-08
 * ===============================================================
 */
export class ObtenerEventoUseCase {
  constructor(private readonly eventoRepository: EventoRepository) {}

  async execute(input: ObtenerEventoInput): Promise<ObtenerEventoOutput> {
    try {
      // 1. Validaciones de entrada
      this.validarInputs(input);

      // 2. Buscar el evento en el repositorio
      const evento = await this.eventoRepository.buscarPorId(input.id);

      // 3. Validar que el evento existe
      if (!evento) {
        throw new EventoNoEncontradoException(input.id);
      }

      // 4. Validaciones de dominio adicionales
      if (!evento.estaActivo()) {
        throw new EventoNoEncontradoException(input.id); // No revelamos que existe pero está inactivo
      }

      // 5. Convertir entidad de dominio a DTO de salida
      return {
        evento: evento.toJson(),
      };
    } catch (error) {
      // Manejo de errores con logging
      console.error('Error en ObtenerEventoUseCase:', error);

      // Re-lanzar errores de dominio tal como están
      if (this.isDomainException(error)) {
        throw error;
      }

      // Convertir errores genéricos a errores de dominio
      if (error instanceof Error) {
        throw new ErrorBaseDatosException('obtener evento', error.message);
      }

      throw new ErrorBaseDatosException('obtener evento');
    }
  }

  /**
   * Validar los inputs del caso de uso
   */
  private validarInputs(input: ObtenerEventoInput): void {
    if (!input.id) {
      throw new ParametroInvalidoException('id', input.id, 'ID del evento es requerido');
    }

    if (typeof input.id !== 'string') {
      throw new ParametroInvalidoException(
        'id',
        String(input.id),
        'ID debe ser una cadena de texto'
      );
    }

    if (input.id.trim().length === 0) {
      throw new ParametroInvalidoException('id', input.id, 'ID no puede estar vacío');
    }

    // Validación básica de formato de ID (CUID)
    if (input.id.length < 7) {
      throw new ParametroInvalidoException('id', input.id, 'Formato de ID inválido');
    }
  }

  /**
   * Verificar si el error es una excepción de dominio
   */
  private isDomainException(error: unknown): boolean {
    return error instanceof Error && error.constructor.name.endsWith('Exception');
  }
}
