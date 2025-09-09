import { EventoRepository } from '../domain/repositories/evento.repository';
import { PrismaEventoRepository } from './repositories/prisma-evento.repository';
import { MockEventoRepository } from './repositories/mock-evento.repository';
import { ListarEventosUseCase } from '../application/use-cases/listar-eventos.use-case';
import { ObtenerEventoUseCase } from '../application/use-cases/obtener-evento.use-case';
import { EventoController } from '../presentation/controllers/evento.controller';

/**
 * ===============================================================
 * DEPENDENCY INJECTION CONTAINER
 * ===============================================================
 *
 * PROPÓSITO:
 * Este container gestiona la creación e inyección de todas las dependencias
 * del sistema. Implementa el patrón Composition Root donde toda la
 * aplicación se ensambla en un punto centralizado.
 *
 * PATRÓN SINGLETON:
 * - Una sola instancia del container en toda la aplicación
 * - Evita crear múltiples instancias de servicios costosos
 * - Facilita el manejo del ciclo de vida de dependencias
 *
 * LAZY LOADING:
 * - Las dependencias se crean solo cuando se necesitan
 * - Mejora el tiempo de arranque de la aplicación
 * - Evita circular dependencies
 *
 * ARQUITECTURA DE DEPENDENCIAS:
 * ```
 * Controller
 *    ↓
 * Use Cases
 *    ↓
 * Repository Interface ← Repository Implementation
 * ```
 *
 * PARA EL EQUIPO:
 * - Este es el ÚNICO lugar donde se crean instancias concretas
 * - Para agregar nuevos servicios, agrégalos aquí
 * - Para testing, usa registerEventoRepository() con mocks
 * - El método clear() es útil para limpiar entre tests
 *
 * TESTING:
 * ```typescript
 * // En tests
 * diContainer.registerEventoRepository(new MockEventoRepository());
 * const controller = diContainer.getEventoController();
 * ```
 *
 * EXTENDING:
 * - Para nuevos casos de uso: agregar getter y dependency injection
 * - Para nuevos repositorios: seguir el mismo patrón
 * - Mantener lazy loading para performance
 *
 * @author Clean Architecture Implementation - Sistema de Eventos
 * @version 1.0.0
 * @since 2024-12-08
 * ===============================================================
 */
class DIContainer {
  private static instance: DIContainer;

  // Repositorios
  private _eventoRepository?: EventoRepository;

  // Casos de uso
  private _listarEventosUseCase?: ListarEventosUseCase;
  private _obtenerEventoUseCase?: ObtenerEventoUseCase;

  // Controladores
  private _eventoController?: EventoController;

  /**
   * Singleton pattern para garantizar una sola instancia del container
   */
  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  /**
   * Obtiene el repositorio de eventos (lazy loading)
   *
   * USANDO MOCK TEMPORAL: Para demostrar Arquitectura Limpia mientras se configura Prisma
   * TODO: Cambiar a PrismaEventoRepository cuando Prisma esté configurado correctamente
   */
  public getEventoRepository(): EventoRepository {
    if (!this._eventoRepository) {
      // TEMPORAL: Usar datos mock para demostrar Arquitectura Limpia
      this._eventoRepository = new MockEventoRepository();

      // TODO: Descomentar cuando Prisma funcione correctamente:
      // this._eventoRepository = new PrismaEventoRepository();
    }
    return this._eventoRepository;
  }

  /**
   * Obtiene el caso de uso para listar eventos (lazy loading)
   */
  public getListarEventosUseCase(): ListarEventosUseCase {
    if (!this._listarEventosUseCase) {
      this._listarEventosUseCase = new ListarEventosUseCase(this.getEventoRepository());
    }
    return this._listarEventosUseCase;
  }

  /**
   * Obtiene el caso de uso para obtener un evento (lazy loading)
   */
  public getObtenerEventoUseCase(): ObtenerEventoUseCase {
    if (!this._obtenerEventoUseCase) {
      this._obtenerEventoUseCase = new ObtenerEventoUseCase(this.getEventoRepository());
    }
    return this._obtenerEventoUseCase;
  }

  /**
   * Obtiene el controlador de eventos (lazy loading)
   */
  public getEventoController(): EventoController {
    if (!this._eventoController) {
      this._eventoController = new EventoController(
        this.getListarEventosUseCase(),
        this.getObtenerEventoUseCase()
      );
    }
    return this._eventoController;
  }

  /**
   * Método para limpiar el container (útil para testing)
   */
  public clear(): void {
    this._eventoRepository = undefined;
    this._listarEventosUseCase = undefined;
    this._obtenerEventoUseCase = undefined;
    this._eventoController = undefined;
  }

  /**
   * Método para registrar implementaciones personalizadas (útil para testing)
   */
  public registerEventoRepository(repository: EventoRepository): void {
    this._eventoRepository = repository;
    // Limpiar dependientes para que se recreen con la nueva implementación
    this._listarEventosUseCase = undefined;
    this._obtenerEventoUseCase = undefined;
    this._eventoController = undefined;
  }
}

// Exportar instancia singleton
export const diContainer = DIContainer.getInstance();

/**
 * Función helper para obtener el controlador configurado
 * Esta función es el punto de entrada principal para la aplicación
 */
export function getEventoController(): EventoController {
  return diContainer.getEventoController();
}
