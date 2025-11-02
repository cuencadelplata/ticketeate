// Tipos para configuración de eventos
export interface QueueSettings {
  maxConcurrentUsers: number; // Usuarios máximos simultáneos
  maxQueueLength: number; // Longitud máxima de la cola
  processingTimePerUser: number; // Tiempo estimado por usuario (segundos)
  isQueueEnabled: boolean; // Habilitar/deshabilitar cola
  queueStartTime?: Date; // Hora de inicio de la cola
  queueEndTime?: Date; // Hora de fin de la cola
}

export interface AdvancedEventSettings {
  visibilityStart: Date; // Fecha de inicio de visibilidad
  visibilityEnd: Date; // Fecha de fin de visibilidad
  maxPurchasePerUser: number; // Máximo de compras por usuario
  maxTicketsPerPurchase: number; // Máximo de entradas por compra
  requiresIdentification: boolean; // Requiere identificación
  allowsResale: boolean; // Permite reventa
  isHighDemand: boolean; // Evento de alta demanda
  termsAndConditions: string; // Términos y condiciones específicos
}

export interface CategorySettings {
  id: string;
  name: string;
  price: number;
  maxPerUser: number;
  maxTotal: number;
  description: string;
  benefits: string[];
  type: 'general' | 'vip' | 'premium' | 'custom';
  isEnabled: boolean;
}

export interface EventSettings {
  queueSettings: QueueSettings;
  advancedSettings: AdvancedEventSettings;
  categories: CategorySettings[];
}
