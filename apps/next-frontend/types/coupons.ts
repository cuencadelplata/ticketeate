export interface Coupon {
  cuponid: string;
  eventoid: string;
  codigo: string;
  porcentaje_descuento: number;
  fecha_creacion: Date;
  fecha_expiracion: Date;
  limite_usos: number;
  usos_actuales: number;
  estado: 'ACTIVO' | 'INACTIVO' | 'EXPIRADO' | 'AGOTADO';
}

export interface CreateCouponData {
  eventoid: string;
  codigo: string;
  porcentaje_descuento: number;
  fecha_expiracion: Date;
  limite_usos: number;
}

export interface RedeemCouponData {
  codigo: string;
  eventoid: string;
  usuarioid: string;
}

export interface RedemptionResult {
  success: boolean;
  descuento_aplicado?: number;
  error?: string;
}

export interface CouponStats {
  total_redimidos: number;
  descuento_total: number;
  disponibles: number;
}