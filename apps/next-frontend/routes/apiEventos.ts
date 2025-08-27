import { prisma } from '../../../packages/db/src';

// Tipos TypeScript para la API de eventos
export interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  ubicacion: string;
  precio: number;
  capacidad: number;
  disponibles: number;
  categoria: Categoria;
  imagenes: ImagenEvento[];
  estado: 'activo' | 'cancelado' | 'completado';
  createdAt: Date;
  updatedAt: Date;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface ImagenEvento {
  id: string;
  url: string;
  alt: string;
  esPrincipal: boolean;
}

export interface PaginacionParams {
  pagina: number;
  limite: number;
}

export interface FiltrosEventos {
  fechaInicio?: Date;
  fechaFin?: Date;
  ubicacion?: string;
  categoriaId?: string;
  precioMin?: number;
  precioMax?: number;
}

export interface RespuestaPaginada<T> {
  datos: T[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}
