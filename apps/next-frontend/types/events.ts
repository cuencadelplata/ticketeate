// Definición de tipos
export interface Event {
  eventoid: string;
  titulo: string;
  descripcion?: string;
  ubicacion: string;
  fecha_creacion: Date;
  creadorid: string;
  mapa_evento: any;
  fecha_cambio: Date;
  imagenes_evento: Array<{
    imagenid: string;
    url: string;
    tipo: string;
  }>;
  fechas_evento?: Array<{
    fechaid: string;
    fecha_hora: Date;
    fecha_fin?: Date;
  }>;
  stock_entrada?: Array<{
    stockid: string;
    nombre: string;
    precio: bigint;
    cant_max: number;
  }>;
  evento_estado?: Array<{
    stateventid: string;
    Estado: string;
    fecha_de_cambio: Date;
  }>;
  catevento?: Array<{
    categoriaeventoid: bigint;
    categoriaevento: {
      nombre: string;
      descripcion?: string;
    };
  }>;
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
  eventMap?: {
    sectors: Array<{
      id: string;
      name: string;
      type: 'general' | 'vip' | 'premium' | 'custom';
      color: string;
      x: number;
      y: number;
      width: number;
      height: number;
      capacity?: number;
      price?: number;
      isGrid?: boolean;
      rows?: number;
      columns?: number;
    }>;
    elements?: Array<{
      id: string;
      name: string;
      type: 'stage' | 'bathroom' | 'bar' | 'entrance' | 'exit' | 'parking' | 'custom';
      icon: string;
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    }>;
    backgroundImage?: string;
  };
  ticket_types?: Array<{
    nombre: string;
    descripcion?: string;
    precio: number;
    stock_total: number;
  }>;
  categorias?: Array<{
    id?: number;
    nombre: string;
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

export interface GetAllEventsResponse {
  events: Event[];
  total: number;
}

export interface GetPublicEventResponse {
  event: Event;
}
