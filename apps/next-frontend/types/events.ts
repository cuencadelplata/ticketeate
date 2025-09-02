import type { eventos, imagenes_evento, fechas_evento } from '@repo/db';

// Tipos para eventos - usando los tipos de Prisma del paquete @db
export interface Event extends Omit<eventos, 'id_evento'> {
  id_evento: string;
  imagenes_evento: Array<
    Omit<imagenes_evento, 'id_imagen' | 'id_evento'> & {
      id_imagen: string;
    }
  >;
  fechas_evento?: Array<
    Omit<fechas_evento, 'id_fecha' | 'id_evento'> & {
      id_fecha: string;
    }
  >;
}

export interface CreateEventData {
  titulo: string;
  descripcion?: string;
  ubicacion?: string;
  fecha_inicio_venta: string;
  fecha_fin_venta: string;
  estado?: 'ACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'OCULTO';
  imageUrl?: string;
  galeria_imagenes?: string[];
  fechas_adicionales?: Array<{
    fecha_inicio: string;
    fecha_fin: string;
  }>;
}

export interface EventImage {
  id_imagen: string;
  url: string;
  tipo: 'portada' | 'galeria';
}

export interface EventDate {
  id_fecha: string;
  fecha_hora: string;
}

// Tipos para el formulario
export interface EventFormData {
  eventName: string;
  description: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  } | null;
  eventImages: string[];
  eventDates: Array<{
    id: string;
    startDate: Date;
    endDate: Date;
    startTime: string;
    endTime: string;
    isMain: boolean;
  }>;
  visibility: 'public' | 'private';
}

// Respuestas de la API
export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

export interface CreateEventResponse {
  message: string;
  event: Event;
}

export interface GetEventsResponse {
  events: Event[];
  total: number;
  userId: string;
}

export interface GetEventResponse {
  event: Event;
  userId: string;
}
