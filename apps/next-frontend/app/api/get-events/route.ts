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

import { NextRequest } from 'next/server';
import { getEventoController } from './infrastructure/di-container';

/**
 * Manejador API de Arquitectura Limpia - VERSIÓN FUNCIONAL
 *
 * Implementación completa de Arquitectura Limpia:
 * - Capa de dominio: Entidades, Value Objects, Repositorios
 * - Capa de aplicación: Casos de Uso con lógica de negocio
 * - Capa de infraestructura: Repository con datos mock (temporal)
 * - Capa de presentación: Controladores HTTP
 *
 * USANDO DATOS MOCK: Temporalmente mientras se configura Prisma Client en monorepo
 * TODO: Cambiar a PrismaEventoRepository cuando Prisma esté configurado
 *
 * Funcionalidades soportadas:
 * - GET /api/get-events -> Listar eventos con paginación y filtros
 * - GET /api/get-events?id=123 -> Obtener evento específico
 *
 * @param request NextRequest de Next.js
 * @returns NextResponse con datos de demostración via Arquitectura Limpia
 */
export async function GET(request: NextRequest) {
  console.log('=== API ARQUITECTURA LIMPIA - FUNCIONANDO ===');
  console.log('Demostrando Arquitectura Limpia con datos mock realistas');

  // Obtener el controlador configurado con todas sus dependencias
  // Actualmente usa MockEventoRepository para demostración
  const eventoController = getEventoController();

  // Delegar la petición al controlador siguiendo Arquitectura Limpia
  return eventoController.handleGetRequest(request);
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
