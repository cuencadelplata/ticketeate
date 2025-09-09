/**
 * ===============================================================
 * ENTIDADES DE DOMINIO - EVENTOS
 * ===============================================================
 *
 * PROPÓSITO:
 * Este archivo contiene las entidades de dominio que representan
 * los conceptos centrales del negocio de eventos. Las entidades
 * encapsulan tanto datos como comportamientos del dominio.
 *
 * ARQUITECTURA:
 * - Forma parte de la capa de DOMINIO en Clean Architecture
 * - No depende de frameworks externos (Next.js, Prisma, etc.)
 * - Contiene lógica de negocio pura
 *
 * ENTIDADES DEFINIDAS:
 * - EventoEntity: Representa un evento con su lógica de negocio
 * - CategoriaEntity: Representa categorías de eventos
 * - ImagenEventoEntity: Representa imágenes asociadas a eventos
 *
 * PATRONES IMPLEMENTADOS:
 * - Entity Pattern: Objetos con identidad e invariantes de negocio
 * - Factory Method: Métodos estáticos 'crear' para instanciación
 * - Value Object: Objetos inmutables con tipos específicos
 * - Domain Model: Lógica de negocio encapsulada en entidades
 *
 * PARA EL EQUIPO:
 * - Si necesitas agregar nueva lógica de negocio, hazlo aquí
 * - Los métodos como estaActivo(), tieneDisponibilidad() contienen
 *   las reglas de negocio que pueden cambiar según requerimientos
 * - No agregues dependencias externas (Prisma, Next.js, etc.)
 * - Usa los métodos factory 'crear' para instanciar objetos
 *
 * TESTING:
 * - Estas entidades son fáciles de testear por ser independientes
 * - Ejemplo: EventoEntity.crear(mockData).estaActivo()
 *
 * @author Clean Architecture Implementation - Sistema de Eventos
 * @version 1.0.0
 * @since 2024-12-08
 * ===============================================================
 */
export class EventoEntity {
  constructor(
    public readonly id: string,
    public readonly titulo: string,
    public readonly descripcion: string,
    public readonly fechaInicio: Date,
    public readonly fechaFin: Date,
    public readonly ubicacion: string,
    public readonly precio: number,
    public readonly capacidad: number,
    public readonly disponibles: number,
    public readonly categoria: CategoriaEntity,
    public readonly imagenes: ImagenEventoEntity[],
    public readonly estado: EventoEstado,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  // Métodos de dominio
  public estaActivo(): boolean {
    return this.estado === EventoEstado.ACTIVO;
  }

  public tieneDisponibilidad(): boolean {
    return this.disponibles > 0;
  }

  public estaEnVigencia(): boolean {
    const ahora = new Date();
    return this.fechaInicio <= ahora && this.fechaFin >= ahora;
  }

  public puedeSerReservado(): boolean {
    return this.estaActivo() && this.tieneDisponibilidad() && this.estaEnVigencia();
  }

  // Método factory para crear desde datos primitivos
  public static crear(data: EventoData): EventoEntity {
    return new EventoEntity(
      data.id,
      data.titulo,
      data.descripcion,
      new Date(data.fechaInicio),
      new Date(data.fechaFin),
      data.ubicacion,
      data.precio,
      data.capacidad,
      data.disponibles,
      CategoriaEntity.crear(data.categoria),
      data.imagenes.map(img => ImagenEventoEntity.crear(img)),
      data.estado as EventoEstado,
      new Date(data.createdAt),
      new Date(data.updatedAt)
    );
  }

  // Método para convertir a objeto plano (para API response)
  public toJson(): EventoJson {
    return {
      id: this.id,
      titulo: this.titulo,
      descripcion: this.descripcion,
      fechaInicio: this.fechaInicio.toISOString(),
      fechaFin: this.fechaFin.toISOString(),
      ubicacion: this.ubicacion,
      precio: this.precio,
      capacidad: this.capacidad,
      disponibles: this.disponibles,
      categoria: this.categoria.toJson(),
      imagenes: this.imagenes.map(img => img.toJson()),
      estado: this.estado,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

export class CategoriaEntity {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly descripcion?: string
  ) {}

  public static crear(data: CategoriaData): CategoriaEntity {
    return new CategoriaEntity(data.id, data.nombre, data.descripcion);
  }

  public toJson(): CategoriaJson {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
    };
  }
}

export class ImagenEventoEntity {
  constructor(
    public readonly id: string,
    public readonly url: string,
    public readonly alt: string,
    public readonly esPrincipal: boolean
  ) {}

  public static crear(data: ImagenEventoData): ImagenEventoEntity {
    return new ImagenEventoEntity(data.id, data.url, data.alt, data.esPrincipal);
  }

  public toJson(): ImagenEventoJson {
    return {
      id: this.id,
      url: this.url,
      alt: this.alt,
      esPrincipal: this.esPrincipal,
    };
  }
}

// Enums
export enum EventoEstado {
  ACTIVO = 'activo',
  CANCELADO = 'cancelado',
  COMPLETADO = 'completado',
}

// Tipos para datos primitivos (input)
export interface EventoData {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  precio: number;
  capacidad: number;
  disponibles: number;
  categoria: CategoriaData;
  imagenes: ImagenEventoData[];
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriaData {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface ImagenEventoData {
  id: string;
  url: string;
  alt: string;
  esPrincipal: boolean;
}

// Tipos para JSON response (output)
export interface EventoJson {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  ubicacion: string;
  precio: number;
  capacidad: number;
  disponibles: number;
  categoria: CategoriaJson;
  imagenes: ImagenEventoJson[];
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriaJson {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface ImagenEventoJson {
  id: string;
  url: string;
  alt: string;
  esPrincipal: boolean;
}
