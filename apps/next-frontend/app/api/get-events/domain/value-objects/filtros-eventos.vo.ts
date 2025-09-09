/**
 * ===============================================================
 * VALUE OBJECTS - FILTROS DE EVENTOS
 * ===============================================================
 *
 * PROPÓSITO:
 * Este archivo contiene el Value Object para manejar filtros
 * en búsquedas de eventos con validaciones de negocio integradas.
 *
 * FUNCIONALIDADES:
 * - Validación de rangos de fechas y precios
 * - Transformación desde parámetros HTTP
 * - Métodos helper para verificar tipos de filtros activos
 *
 * VALIDACIONES INCLUIDAS:
 * - Fechas: inicio no puede ser posterior al fin
 * - Precios: no pueden ser negativos, min <= max
 * - Ubicación: mínimo 2 caracteres para búsqueda
 *
 * PARA EL EQUIPO:
 * - Usa crearDeParametros() para convertir desde URL params
 * - Las validaciones lanzan errores descriptivos
 * - Los métodos tiene*() ayudan a verificar filtros activos
 * - Si necesitas más filtros, agrégalos con sus validaciones
 *
 * EJEMPLO DE USO:
 * ```typescript
 * const filtros = FiltrosEventosVO.crearDeParametros(searchParams);
 * if (filtros.tieneFiltroPrecios()) {
 *   // aplicar lógica específica para filtros de precio
 * }
 * ```
 *
 * EXTENDING:
 * - Para agregar filtros: añadir campo + validación + método helper
 * - Mantener inmutabilidad del objeto
 *
 * @author Clean Architecture Implementation - Sistema de Eventos
 * @version 1.0.0
 * @since 2024-12-08
 * ===============================================================
 */
export class FiltrosEventosVO {
  constructor(
    public readonly fechaInicio?: Date,
    public readonly fechaFin?: Date,
    public readonly ubicacion?: string,
    public readonly categoriaId?: string,
    public readonly precioMin?: number,
    public readonly precioMax?: number
  ) {
    // Validaciones de dominio
    if (this.fechaInicio && this.fechaFin && this.fechaInicio > this.fechaFin) {
      throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
    }

    if (this.precioMin !== undefined && this.precioMin < 0) {
      throw new Error('El precio mínimo no puede ser negativo');
    }

    if (this.precioMax !== undefined && this.precioMax < 0) {
      throw new Error('El precio máximo no puede ser negativo');
    }

    if (
      this.precioMin !== undefined &&
      this.precioMax !== undefined &&
      this.precioMin > this.precioMax
    ) {
      throw new Error('El precio mínimo no puede ser mayor al precio máximo');
    }

    if (this.ubicacion !== undefined && this.ubicacion.length < 2) {
      throw new Error('La ubicación debe tener al menos 2 caracteres');
    }
  }

  public static crearDeParametros(searchParams: URLSearchParams): FiltrosEventosVO {
    const fechaInicioStr = searchParams.get('fechaInicio');
    const fechaFinStr = searchParams.get('fechaFin');
    const ubicacion = searchParams.get('ubicacion');
    const categoriaId = searchParams.get('categoriaId');
    const precioMinStr = searchParams.get('precioMin');
    const precioMaxStr = searchParams.get('precioMax');

    return new FiltrosEventosVO(
      fechaInicioStr ? new Date(fechaInicioStr) : undefined,
      fechaFinStr ? new Date(fechaFinStr) : undefined,
      ubicacion || undefined,
      categoriaId || undefined,
      precioMinStr ? Number(precioMinStr) : undefined,
      precioMaxStr ? Number(precioMaxStr) : undefined
    );
  }

  public tieneAlgunFiltro(): boolean {
    return !!(
      this.fechaInicio ||
      this.fechaFin ||
      this.ubicacion ||
      this.categoriaId ||
      this.precioMin !== undefined ||
      this.precioMax !== undefined
    );
  }

  public tieneFiltroFecha(): boolean {
    return !!(this.fechaInicio || this.fechaFin);
  }

  public tieneFiltroUbicacion(): boolean {
    return !!this.ubicacion;
  }

  public tieneFiltroCategoria(): boolean {
    return !!this.categoriaId;
  }

  public tieneFiltroPrecios(): boolean {
    return this.precioMin !== undefined || this.precioMax !== undefined;
  }
}
