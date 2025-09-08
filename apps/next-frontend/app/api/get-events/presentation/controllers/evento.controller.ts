import { NextRequest, NextResponse } from 'next/server';
import { ListarEventosUseCase } from '../../application/use-cases/listar-eventos.use-case';
import { ObtenerEventoUseCase } from '../../application/use-cases/obtener-evento.use-case';
import { DomainException } from '../../domain/exceptions/evento.exceptions';

/**
 * CONTROLADOR DE EVENTOS - MANEJADOR HTTP
 * 
 * PROPÓSITO:
 * Este controlador maneja las peticiones HTTP para eventos.
 * Actúa como adaptador entre el protocolo HTTP y los casos de uso
 * del dominio, siguiendo el patrón Controller de Arquitectura Limpia.
 * 
 * RESPONSABILIDADES:
 * - Extraer y validar parámetros HTTP
 * - Delegar lógica de negocio a casos de uso
 * - Transformar respuestas de dominio a HTTP
 * - Manejar errores y códigos de status apropiados
 * - Configurar headers de cache y respuesta
 * 
 * ENDPOINTS SOPORTADOS:
 * - GET /api/get-events → Listar eventos paginados
 * - GET /api/get-events?id=123 → Obtener evento específico
 * 
 * CARACTERÍSTICAS HTTP:
 * - Headers de cache configurados por tipo de consulta
 * - Headers informativos (X-Total-Count, X-Page, etc.)
 * - Manejo centralizado de errores con códigos HTTP apropiados
 * - Soporte para múltiples formatos de parámetros (page/pagina, limit/limite)
 * 
 * PARA EL EQUIPO:
 * - Agrega nuevos endpoints como métodos privados
 * - El manejo de errores es centralizado en manejarError()
 * - Los headers de cache pueden ajustarse según necesidades
 * - Para nuevos filtros, extiende extraerFiltros()
 * 
 * MANEJO DE ERRORES:
 * - Errores de dominio → Status codes específicos + mensaje descriptivo
 * - Errores de validación → 400 Bad Request
 * - Errores técnicos → 500 Internal Server Error
 * - Timestamps y códigos de error consistentes
 * 
 * RENDIMIENTO:
 * - Cache headers configurados (5 min evento, 2 min listado)
 * - Headers informativos para paginación eficiente en frontend
 * 
 * @author Implementación de Arquitectura Limpia - Sistema de Eventos
 * @version 1.0.0
 * @since 2024-12-08
 */
export class EventoController {
  constructor(
    private readonly listarEventosUseCase: ListarEventosUseCase,
    private readonly obtenerEventoUseCase: ObtenerEventoUseCase
  ) {}

  /**
   * Maneja peticiones GET para listar eventos o obtener uno específico
   */
  async handleGetRequest(request: NextRequest): Promise<NextResponse> {
    try {
      const url = new URL(request.url);
      const params = url.searchParams;

      // Si se solicita por id, devolver detalle
      const id = params.get('id');
      if (id) {
        return await this.obtenerEventoEspecifico(id);
      }

      // Caso contrario, listar eventos con filtros
      return await this.listarEventos(params);

    } catch (error) {
      console.error('Error en handleGetRequest:', error);
      return this.manejarError(error);
    }
  }

  /**
   * Obtiene un evento específico por ID
   */
  private async obtenerEventoEspecifico(id: string): Promise<NextResponse> {
    try {
      const resultado = await this.obtenerEventoUseCase.execute({ id });
      
      return NextResponse.json(resultado.evento, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache por 5 minutos
        },
      });

    } catch (error) {
      return this.manejarError(error);
    }
  }

  /**
   * Lista eventos con paginación y filtros
   */
  private async listarEventos(searchParams: URLSearchParams): Promise<NextResponse> {
    try {
      // Extraer parámetros de paginación
      const pagina = searchParams.get('page') ?? searchParams.get('pagina') ?? undefined;
      const limite = searchParams.get('limit') ?? searchParams.get('limite') ?? undefined;

      // Extraer filtros opcionales
      const filtros = this.extraerFiltros(searchParams);

      // Ejecutar caso de uso
      const resultado = await this.listarEventosUseCase.execute({
        pagina,
        limite,
        filtros: Object.keys(filtros).length > 0 ? filtros : undefined,
      });

      return NextResponse.json(resultado, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=120', // Cache por 2 minutos
          'X-Total-Count': resultado.paginacion.total.toString(),
          'X-Page': resultado.paginacion.pagina.toString(),
          'X-Per-Page': resultado.paginacion.limite.toString(),
          'X-Total-Pages': resultado.paginacion.totalPaginas.toString(),
        },
      });

    } catch (error) {
      return this.manejarError(error);
    }
  }

  /**
   * Extrae filtros de los parámetros de búsqueda
   */
  private extraerFiltros(searchParams: URLSearchParams) {
    const filtros: any = {};

    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const ubicacion = searchParams.get('ubicacion');
    const categoriaId = searchParams.get('categoriaId');
    const precioMin = searchParams.get('precioMin');
    const precioMax = searchParams.get('precioMax');

    if (fechaInicio) filtros.fechaInicio = fechaInicio;
    if (fechaFin) filtros.fechaFin = fechaFin;
    if (ubicacion) filtros.ubicacion = ubicacion;
    if (categoriaId) filtros.categoriaId = categoriaId;
    if (precioMin) filtros.precioMin = precioMin;
    if (precioMax) filtros.precioMax = precioMax;

    return filtros;
  }

  /**
   * Maneja errores de dominio y técnicos de manera centralizada
   */
  private manejarError(error: unknown): NextResponse {
    // Errores de dominio con manejo específico
    if (error instanceof DomainException) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          timestamp: new Date().toISOString()
        },
        { status: error.statusCode }
      );
    }

    // Errores de validación
    if (error instanceof Error && error.message.includes('inválido')) {
      return NextResponse.json(
        { 
          error: error.message,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Errores genéricos
    console.error('Error no manejado en EventoController:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        code: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
