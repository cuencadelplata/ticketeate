/**
 * ===============================================================
 * VALUE OBJECTS - PAGINACIÓN
 * ===============================================================
 * 
 * PROPÓSITO:
 * Este archivo contiene Value Objects para el manejo de paginación
 * en consultas de eventos. Los VOs encapsulan validaciones y
 * cálculos relacionados con la paginación.
 * 
 * VALUE OBJECTS DEFINIDOS:
 * - PaginacionVO: Maneja parámetros de paginación con validaciones
 * - RespuestaPaginadaVO: Estructura para respuestas paginadas
 * 
 * CARACTERÍSTICAS DE VALUE OBJECTS:
 * - Inmutables: Una vez creados, no se pueden modificar
 * - Sin identidad: Se comparan por valor, no por referencia
 * - Validaciones: Contienen reglas de negocio para sus valores
 * - Autocontenidos: Toda la lógica relacionada está encapsulada
 * 
 * PARA EL EQUIPO:
 * - Usa PaginacionVO.crear() para crear instancias validadas
 * - Los límites están configurados (máx 100, mín 1)
 * - Si necesitas cambiar reglas de paginación, modifica aquí
 * - El skip se calcula automáticamente para Prisma
 * 
 * EJEMPLO DE USO:
 * ```typescript
 * const paginacion = PaginacionVO.crear('2', '10'); // página 2, 10 items
 * console.log(paginacion.skip); // 10 (se calcula automáticamente)
 * ```
 * 
 * TESTING:
 * - Prueba casos límite: página 0, límite negativo, etc.
 * - Los VOs lanzan errores descriptivos para valores inválidos
 * 
 * @author Clean Architecture Implementation - Sistema de Eventos
 * @version 1.0.0
 * @since 2024-12-08
 * ===============================================================
 */
export class PaginacionVO {
  public readonly pagina: number;
  public readonly limite: number;
  public readonly skip: number;

  constructor(pagina: number, limite: number) {
    // Validaciones de dominio
    if (pagina < 1) {
      throw new Error('La página debe ser mayor a 0');
    }
    if (limite < 1) {
      throw new Error('El límite debe ser mayor a 0');
    }
    if (limite > 100) {
      throw new Error('El límite máximo es 100');
    }

    this.pagina = pagina;
    this.limite = limite;
    this.skip = (pagina - 1) * limite;
  }

  public static crear(pagina?: string | number, limite?: string | number): PaginacionVO {
    const paginaNum = typeof pagina === 'string' ? parseInt(pagina) : pagina ?? 1;
    const limiteNum = typeof limite === 'string' ? parseInt(limite) : limite ?? 10;
    
    return new PaginacionVO(
      Math.max(1, paginaNum),
      Math.max(1, Math.min(100, limiteNum))
    );
  }

  public calcularTotalPaginas(totalElementos: number): number {
    return Math.ceil(totalElementos / this.limite);
  }
}

// Value Object para respuesta paginada
export class RespuestaPaginadaVO<T> {
  constructor(
    public readonly datos: T[],
    public readonly paginacion: {
      pagina: number;
      limite: number;
      total: number;
      totalPaginas: number;
    }
  ) {}

  public static crear<T>(
    datos: T[],
    paginacionVO: PaginacionVO,
    total: number
  ): RespuestaPaginadaVO<T> {
    return new RespuestaPaginadaVO(datos, {
      pagina: paginacionVO.pagina,
      limite: paginacionVO.limite,
      total,
      totalPaginas: paginacionVO.calcularTotalPaginas(total)
    });
  }
}
