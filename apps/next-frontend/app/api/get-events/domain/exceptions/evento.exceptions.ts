/**
 * ===============================================================
 * EXCEPCIONES DE DOMINIO - EVENTOS
 * ===============================================================
 *
 * PROPÓSITO:
 * Este archivo define excepciones específicas del dominio de eventos.
 * Las excepciones de dominio representan violaciones de reglas de
 * negocio y situaciones excepcionales del modelo de dominio.
 *
 * PATRÓN DOMAIN EXCEPTIONS:
 * - Cada excepción tiene un código y status HTTP específico
 * - Mensajes descriptivos para debugging y logging
 * - Jerarquía clara heredando de DomainException
 *
 * VENTAJAS:
 * - Manejo centralizado de errores por tipo
 * - Códigos consistentes para el frontend
 * - Separación entre errores de dominio y técnicos
 * - Fácil identificación de problemas en logs
 *
 * PARA EL EQUIPO:
 * - Usa estas excepciones en lugar de Error genérico
 * - Cada excepción mapea a un status HTTP específico
 * - El controlador las maneja automáticamente
 * - Para nuevas reglas de negocio, crea nuevas excepciones aquí
 *
 * EJEMPLO DE USO:
 * ```typescript
 * if (!evento.estaActivo()) {
 *   throw new EventoInactivoException(evento.id);
 * }
 * ```
 *
 * CÓDIGOS DE ERROR:
 * - EVENTO_NO_ENCONTRADO: 404
 * - EVENTO_INACTIVO: 400
 * - PARAMETRO_INVALIDO: 400
 * - ERROR_BASE_DATOS: 500
 *
 * @author Clean Architecture Implementation - Sistema de Eventos
 * @version 1.0.0
 * @since 2024-12-08
 * ===============================================================
 */

export abstract class DomainException extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EventoNoEncontradoException extends DomainException {
  readonly code = 'EVENTO_NO_ENCONTRADO';
  readonly statusCode = 404;

  constructor(eventoId: string) {
    super(`Evento con ID ${eventoId} no encontrado o no disponible`);
  }
}

export class EventoInactivoException extends DomainException {
  readonly code = 'EVENTO_INACTIVO';
  readonly statusCode = 400;

  constructor(eventoId: string) {
    super(`El evento ${eventoId} no está activo`);
  }
}

export class ParametroInvalidoException extends DomainException {
  readonly code = 'PARAMETRO_INVALIDO';
  readonly statusCode = 400;

  constructor(parametro: string, valor: string, razon: string) {
    super(`Parámetro inválido '${parametro}' con valor '${valor}': ${razon}`);
  }
}

export class DisponibilidadInsuficienteException extends DomainException {
  readonly code = 'DISPONIBILIDAD_INSUFICIENTE';
  readonly statusCode = 409;

  constructor(eventoId: string, disponibles: number) {
    super(`El evento ${eventoId} solo tiene ${disponibles} entradas disponibles`);
  }
}

export class FechaNoPasadaException extends DomainException {
  readonly code = 'FECHA_NO_PASADA';
  readonly statusCode = 400;

  constructor(fecha: Date) {
    super(`La fecha ${fecha.toISOString()} ya ha pasado`);
  }
}

export class ErrorBaseDatosException extends DomainException {
  readonly code = 'ERROR_BASE_DATOS';
  readonly statusCode = 500;

  constructor(operacion: string, detalle?: string) {
    super(`Error en base de datos durante ${operacion}${detalle ? ': ' + detalle : ''}`);
  }
}
