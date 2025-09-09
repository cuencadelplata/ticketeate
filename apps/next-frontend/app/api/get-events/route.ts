/**
 * Manejador de Rutas API para Eventos
 *
 * Este archivo implementa Arquitectura Limpia con los siguientes principios:
 * - Separación de responsabilidades en capas
 * - Inversión de dependencias
 * - Casos de uso específicos
 * - Manejo centralizado de errores
 * - Inyección de dependencias
 *
 * Arquitectura implementada:
 *
 * CAPA DE PRESENTACIÓN (Controladores)
 *    ↓ (depende de)
 * CAPA DE APLICACIÓN (Casos de Uso)
 *    ↓ (depende de)
 * CAPA DE DOMINIO (Entidades, Value Objects, Repositorios)
 *    ↑ (implementado por)
 * CAPA DE INFRAESTRUCTURA (Prisma, Base de Datos)
 *
 * @author Sistema de Eventos - Implementación de Arquitectura Limpia
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * API de Eventos - Arquitectura Limpia con Estilo Next.js
 * 
 * NEXT.JS IDIOMÁTICO: Export function directa (no controladores)
 * ARQUITECTURA LIMPIA: Casos de uso y repositorios organizados por capas
 * 
 * Funcionalidades centralizadas:
 * - Listar eventos con paginación y filtros
 * - Obtener detalle específico incluyendo imágenes y categorías  
 * - Disponibilidad en tiempo real
 * - Validaciones de dominio
 * 
 * CENTRALIZACIÓN TOTAL: Todas las consultas de eventos de la aplicación web
 * pública pasan por esta API siguiendo principios de Arquitectura Limpia.
 */
export async function GET(request: NextRequest) {
  try {
    console.log('=== API EVENTOS - ARQUITECTURA LIMPIA ===');
    
    // Obtener casos de uso con inyección de dependencias
    const { diContainer } = await import('./infrastructure/di-container');
    const listarEventosUseCase = diContainer.getListarEventosUseCase();
    const obtenerEventoUseCase = diContainer.getObtenerEventoUseCase();
    
    const url = new URL(request.url);
    const params = url.searchParams;

    // ENDPOINT 1: Obtener evento específico (incluye imágenes y categorías)
    const id = params.get('id');
    if (id) {
      return await obtenerEventoEspecifico(id, obtenerEventoUseCase);
    }

    // ENDPOINT 2: Listar eventos con filtros y paginación
    return await listarEventosConFiltros(params, listarEventosUseCase);
    
  } catch (error) {
    console.error('Error en API de eventos:', error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * FUNCIÓN: Obtener evento específico
 * INCLUYE: Imágenes y categorías completas
 */
async function obtenerEventoEspecifico(id: string, obtenerEventoUseCase: any) {
  try {
    const resultado = await obtenerEventoUseCase.execute({ id });
    
    return NextResponse.json(resultado.evento, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache 5 minutos
      },
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Evento no encontrado'
    }, { status: 404 });
  }
}

/**
 * FUNCIÓN: Listar eventos con filtros
 * SOPORTA: Fecha, ubicación, categoría, precio
 * INCLUYE: Paginación automática
 */
async function listarEventosConFiltros(searchParams: URLSearchParams, listarEventosUseCase: any) {
  try {
    // Extraer paginación (soporte dual: page/pagina, limit/limite)
    const pagina = searchParams.get('page') ?? searchParams.get('pagina');
    const limite = searchParams.get('limit') ?? searchParams.get('limite');

    // Extraer filtros (fecha/ubicación/categoría/precio)
    const filtros = extraerFiltrosDeParametros(searchParams);

    // Ejecutar caso de uso con Arquitectura Limpia
    const resultado = await listarEventosUseCase.execute({
      pagina,
      limite,
      filtros: Object.keys(filtros).length > 0 ? filtros : undefined,
    });

    return NextResponse.json(resultado, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=120', // Cache 2 minutos
        'X-Total-Count': resultado.paginacion.total.toString(),
        'X-Page': resultado.paginacion.pagina.toString(),
        'X-Per-Page': resultado.paginacion.limite.toString(),
        'X-Total-Pages': resultado.paginacion.totalPaginas.toString(),
      },
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Error al listar eventos',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * FUNCIÓN: Extraer filtros de parámetros HTTP
 * FILTROS: fecha, ubicación, categoría, precio
 */
function extraerFiltrosDeParametros(searchParams: URLSearchParams) {
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

/*
 * DOCUMENTACIÓN DE ARQUITECTURA
 *
 * Esta implementación sigue los principios de Arquitectura Limpia:
 *
 * 1. CAPA DE DOMINIO
 *    - entities/: EventoEntity, CategoriaEntity, ImagenEventoEntity
 *    - value-objects/: PaginacionVO, FiltrosEventosVO
 *    - repositories/: EventoRepository (interfaz)
 *    - exceptions/: Excepciones específicas del dominio
 *
 * 2. CAPA DE APLICACIÓN
 *    - use-cases/: ListarEventosUseCase, ObtenerEventoUseCase
 *    - Contiene lógica de negocio y orquesta las operaciones
 *
 * 3. CAPA DE INFRAESTRUCTURA
 *    - repositories/: PrismaEventoRepository (implementación)
 *    - di-container.ts: Inyección de dependencias
 *
 * 4. CAPA DE PRESENTACIÓN
 *    - controllers/: EventoController
 *    - route.ts: Este archivo (punto de entrada HTTP)
 *
 * BENEFICIOS DE ESTA ARQUITECTURA:
 * - Separación clara de responsabilidades
 * - Fácil testing (cada capa se puede probar independientemente)
 * - Flexibilidad para cambiar implementaciones (ej: cambiar Prisma por otro ORM)
 * - Manejo centralizado de errores
 * - Validaciones en el dominio
 * - Código más mantenible y escalable
 *
 * PATRONES DE DISEÑO IMPLEMENTADOS:
 * - Patrón Repository: Abstrae el acceso a datos
 * - Patrón Use Case: Encapsula lógica de negocio específica
 * - Inyección de Dependencias: Gestión de dependencias
 * - Patrón Controller: Maneja peticiones HTTP
 * - Patrón Value Object: Objetos inmutables con validaciones
 * - Patrón Exception: Manejo especializado de errores
 */
