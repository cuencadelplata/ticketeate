// Extensión temporal de tipos para cupones hasta que TypeScript reconozca los tipos generados
import { Prisma, PrismaClient } from '@prisma/client';

declare module '@prisma/client' {
  export interface cupones_evento {
    cuponid: string;
    eventoid: string;
    codigo: string;
    porcentaje_descuento: Prisma.Decimal;
    fecha_creacion: Date;
    fecha_expiracion: Date;
    limite_usos: number;
    usos_actuales: number;
    estado: string;
    version: number;
    is_active: boolean;
    deleted_at: Date | null;
    updated_by: string | null;
  }

  export interface cupones_evento_history {
    history_id: string;
    cuponid: string;
    eventoid: string;
    codigo: string;
    porcentaje_descuento: Prisma.Decimal;
    fecha_creacion: Date;
    fecha_expiracion: Date;
    limite_usos: number;
    usos_actuales: number;
    estado: string;
    version: number;
    changed_at: Date;
    changed_by: string;
    change_type: string;
  }

  export interface cupones_redimidos {
    redencionid: string;
    cuponid: string;
    eventoid: string;
    usuarioid: string;
    fecha_redencion: Date;
    descuento_aplicado: Prisma.Decimal;
  }
}
