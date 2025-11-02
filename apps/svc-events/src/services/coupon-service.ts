import { prisma } from '../config/prisma';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';

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

export class CouponService {
  static async createCoupon(data: CreateCouponData) {
    try {
      const coupon = await prisma.cuponesEvento.create({
        data: {
          cuponid: randomUUID(),
          eventoid: data.eventoid,
          codigo: data.codigo.toUpperCase(),
          porcentaje_descuento: data.porcentaje_descuento,
          fecha_expiracion: data.fecha_expiracion,
          limite_usos: data.limite_usos,
        },
      });
      return coupon;
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('El código del cupón ya existe para este evento');
      }
      throw error;
    }
  }

  static async redeemCoupon(data: RedeemCouponData) {
    try {
      // Iniciar transacción
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Buscar el cupón y bloquearlo para actualización
        const coupon = await tx.cuponesEvento.findFirst({
          where: {
            eventoid: data.eventoid,
            codigo: data.codigo.toUpperCase(),
          },
          select: {
            cuponid: true,
            porcentaje_descuento: true,
            fecha_expiracion: true,
            limite_usos: true,
            usos_actuales: true,
            estado: true,
          },
        });

        if (!coupon) {
          throw new Error('Cupón no encontrado');
        }

        // Verificar si el cupón está activo y válido
        if (coupon.estado !== 'ACTIVO') {
          throw new Error('Cupón no válido: ' + coupon.estado);
        }

        if (coupon.fecha_expiracion < new Date()) {
          throw new Error('Cupón expirado');
        }

        if (coupon.usos_actuales >= coupon.limite_usos) {
          throw new Error('Cupón agotado');
        }

        // Verificar si el usuario ya usó este cupón
        const existingRedemption = await tx.cuponesRedimidos.findFirst({
          where: {
            cuponid: coupon.cuponid,
            usuarioid: data.usuarioid,
            eventoid: data.eventoid,
          },
        });

        if (existingRedemption) {
          throw new Error('Ya has usado este cupón');
        }

        // Obtener el precio del evento
        const event = await tx.eventos.findUnique({
          where: { eventoid: data.eventoid },
          include: {
            stock_entrada: true,
          },
        });

        if (!event?.stock_entrada?.length) {
          throw new Error('No se encontró información de precios para el evento');
        }

        // Calcular el descuento (usando el precio más alto como base)
        const maxPrice = Math.max(...event.stock_entrada.map(ticket => Number(ticket.precio)));
        const descuento = (maxPrice * Number(coupon.porcentaje_descuento)) / 100;

        // Registrar la redención
        await tx.cuponesRedimidos.create({
          data: {
            redencionid: randomUUID(),
            cuponid: coupon.cuponid,
            eventoid: data.eventoid,
            usuarioid: data.usuarioid,
            descuento_aplicado: descuento,
          },
        });

        // Actualizar el contador de usos
        await tx.cuponesEvento.update({
          where: { cuponid: coupon.cuponid },
          data: {
            usos_actuales: {
              increment: 1,
            },
          },
        });

        return {
          success: true,
          descuento_aplicado: descuento,
        };
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: message,
      };
    }
  }

  static async getEventCoupons(eventoid: string) {
    return await prisma.cuponesEvento.findMany({
      where: {
        eventoid,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });
  }

  static async getCouponStats(eventoid: string) {
    const stats = await prisma.cuponesRedimidos.groupBy({
      by: ['cuponid'],
      where: {
        eventoid,
      },
      _count: {
        redencionid: true,
      },
      _sum: {
        descuento_aplicado: true,
      },
    });

    const disponibles = await prisma.cuponesEvento.count({
      where: {
        eventoid,
        estado: 'ACTIVO',
        fecha_expiracion: {
          gt: new Date(),
        },
        // Note: Prisma client cannot compare one column to another in a where clause,
        // so we count active, non-expired coupons here; per-row usage-vs-limit logic
        // should be enforced/queried differently if needed.
      },
    });

    return {
      total_redimidos: stats.reduce((acc, curr) => acc + curr._count.redencionid, 0),
      descuento_total: stats.reduce((acc, curr) => acc + (curr._sum.descuento_aplicado || 0), 0),
      disponibles,
    };
  }

  static async deleteCoupon(cuponid: string) {
    try {
      await prisma.cuponesEvento.update({
        where: { cuponid },
        data: { estado: 'INACTIVO' },
      });
      return true;
    } catch (error: unknown) {
      process.stderr.write(`Error al desactivar cupón: ${String(error)}\n`);
      return false;
    }
  }
}