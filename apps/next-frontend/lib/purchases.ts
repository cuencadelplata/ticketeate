import { prisma } from './prisma';

export interface PurchaseHistoryItem {
  id: string;
  event: {
    id: string;
    name: string;
    description: string | null;
    startDate: Date;
    location: string | null;
    imageUrl: string | null;
  };
  ticketOption: {
    id: string;
    name: string;
    description: string | null;
    price: number;
  } | null;
  quantity: number;
  totalAmount: number;
  status: string;
  paymentMethod: string | null;
  purchaseDate: Date;
  tickets: Array<{
    id: string;
    status: string;
  }>;
}

export interface CreatePurchaseData {
  userId: string;
  eventId: string;
  ticketOptionId?: string;
  quantity: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentId?: string;
}

export class PurchaseService {
  /**
   * Obtiene el historial de compras de un usuario usando el esquema existente
   */
  static async getUserPurchaseHistory(userId: string): Promise<PurchaseHistoryItem[]> {
    try {
      const reservas = await prisma.reservas.findMany({
        where: {
          usuarioid: userId,
        },
        include: {
          eventos: {
            select: {
              eventoid: true,
              titulo: true,
              descripcion: true,
              ubicacion: true,
              fecha_creacion: true,
            },
          },
          stock_entrada: {
            select: {
              stockid: true,
              nombre: true,
              precio: true,
            },
          },
          fechas_evento: {
            select: {
              fecha_hora: true,
            },
          },
          pagos: {
            select: {
              metodo_pago: true,
              monto_total: true,
              fecha_pago: true,
              estado: true,
            },
          },
          entradas: {
            select: {
              entradaid: true,
              estado: true,
            },
          },
        },
        orderBy: {
          fecha_reserva: 'desc',
        },
      });

      return reservas.map(reserva => ({
        id: reserva.reservaid,
        event: {
          id: reserva.eventos.eventoid,
          name: reserva.eventos.titulo,
          description: reserva.eventos.descripcion,
          startDate: reserva.fechas_evento?.fecha_hora || reserva.eventos.fecha_creacion,
          location: reserva.eventos.ubicacion,
          imageUrl: null, // Se puede agregar consultando imagenes_evento si es necesario
        },
        ticketOption: reserva.stock_entrada
          ? {
              id: reserva.stock_entrada.stockid,
              name: reserva.stock_entrada.nombre,
              description: null,
              price: Number(reserva.stock_entrada.precio),
            }
          : null,
        quantity: reserva.cantidad,
        totalAmount: reserva.pagos[0] ? Number(reserva.pagos[0].monto_total) : 0,
        status: reserva.estado,
        paymentMethod: reserva.pagos[0]?.metodo_pago || null,
        purchaseDate: reserva.fecha_reserva,
        tickets: reserva.entradas.map(entrada => ({
          id: entrada.entradaid,
          status: entrada.estado,
        })),
      }));
    } catch (error) {
      console.error('Error getting user purchase history:', error);
      throw new Error('Error al obtener el historial de compras');
    }
  }

  /**
   * Obtiene una compra específica por ID
   */
  static async getPurchaseById(purchaseId: string): Promise<PurchaseHistoryItem | null> {
    try {
      const reserva = await prisma.reservas.findUnique({
        where: {
          reservaid: purchaseId,
        },
        include: {
          eventos: {
            select: {
              eventoid: true,
              titulo: true,
              descripcion: true,
              ubicacion: true,
              fecha_creacion: true,
            },
          },
          stock_entrada: {
            select: {
              stockid: true,
              nombre: true,
              precio: true,
            },
          },
          fechas_evento: {
            select: {
              fecha_hora: true,
            },
          },
          pagos: {
            select: {
              metodo_pago: true,
              monto_total: true,
              fecha_pago: true,
              estado: true,
            },
          },
          entradas: {
            select: {
              entradaid: true,
              estado: true,
            },
          },
        },
      });

      if (!reserva) {
        return null;
      }

      return {
        id: reserva.reservaid,
        event: {
          id: reserva.eventos.eventoid,
          name: reserva.eventos.titulo,
          description: reserva.eventos.descripcion,
          startDate: reserva.fechas_evento?.fecha_hora || reserva.eventos.fecha_creacion,
          location: reserva.eventos.ubicacion,
          imageUrl: null,
        },
        ticketOption: reserva.stock_entrada
          ? {
              id: reserva.stock_entrada.stockid,
              name: reserva.stock_entrada.nombre,
              description: null,
              price: Number(reserva.stock_entrada.precio),
            }
          : null,
        quantity: reserva.cantidad,
        totalAmount: reserva.pagos[0] ? Number(reserva.pagos[0].monto_total) : 0,
        status: reserva.estado,
        paymentMethod: reserva.pagos[0]?.metodo_pago || null,
        purchaseDate: reserva.fecha_reserva,
        tickets: reserva.entradas.map(entrada => ({
          id: entrada.entradaid,
          status: entrada.estado,
        })),
      };
    } catch (error) {
      console.error('Error getting purchase by ID:', error);
      throw new Error('Error al obtener la compra');
    }
  }

  /**
   * Crea una nueva compra (reserva)
   */
  static async createPurchase(data: CreatePurchaseData): Promise<PurchaseHistoryItem> {
    try {
      // Esta función necesitaría ser implementada según la lógica de negocio específica
      // Por ahora, retornamos un error indicando que se necesita implementar
      throw new Error(
        'La creación de compras debe ser implementada según el flujo de negocio específico'
      );
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw new Error('Error al crear la compra');
    }
  }

  /**
   * Actualiza el estado de una compra
   */
  static async updatePurchaseStatus(
    purchaseId: string,
    status: string
  ): Promise<PurchaseHistoryItem> {
    try {
      const reserva = await prisma.reservas.update({
        where: {
          reservaid: purchaseId,
        },
        data: {
          estado: status,
        },
        include: {
          eventos: {
            select: {
              eventoid: true,
              titulo: true,
              descripcion: true,
              ubicacion: true,
              fecha_creacion: true,
            },
          },
          stock_entrada: {
            select: {
              stockid: true,
              nombre: true,
              precio: true,
            },
          },
          fechas_evento: {
            select: {
              fecha_hora: true,
            },
          },
          pagos: {
            select: {
              metodo_pago: true,
              monto_total: true,
              fecha_pago: true,
              estado: true,
            },
          },
          entradas: {
            select: {
              entradaid: true,
              estado: true,
            },
          },
        },
      });

      return {
        id: reserva.reservaid,
        event: {
          id: reserva.eventos.eventoid,
          name: reserva.eventos.titulo,
          description: reserva.eventos.descripcion,
          startDate: reserva.fechas_evento?.fecha_hora || reserva.eventos.fecha_creacion,
          location: reserva.eventos.ubicacion,
          imageUrl: null,
        },
        ticketOption: reserva.stock_entrada
          ? {
              id: reserva.stock_entrada.stockid,
              name: reserva.stock_entrada.nombre,
              description: null,
              price: Number(reserva.stock_entrada.precio),
            }
          : null,
        quantity: reserva.cantidad,
        totalAmount: reserva.pagos[0] ? Number(reserva.pagos[0].monto_total) : 0,
        status: reserva.estado,
        paymentMethod: reserva.pagos[0]?.metodo_pago || null,
        purchaseDate: reserva.fecha_reserva,
        tickets: reserva.entradas.map(entrada => ({
          id: entrada.entradaid,
          status: entrada.estado,
        })),
      };
    } catch (error) {
      console.error('Error updating purchase status:', error);
      throw new Error('Error al actualizar el estado de la compra');
    }
  }

  /**
   * Obtiene estadísticas de compras de un usuario
   */
  static async getUserPurchaseStats(userId: string) {
    try {
      const [totalPurchases, totalSpent, completedPurchases] = await Promise.all([
        prisma.reservas.count({
          where: { usuarioid: userId },
        }),
        prisma.pagos.aggregate({
          where: {
            reservas: {
              usuarioid: userId,
            },
            estado: 'COMPLETADO',
          },
          _sum: {
            monto_total: true,
          },
        }),
        prisma.reservas.count({
          where: {
            usuarioid: userId,
            estado: 'CONFIRMADA',
          },
        }),
      ]);

      return {
        totalPurchases,
        totalSpent: Number(totalSpent._sum.monto_total || 0),
        completedPurchases,
      };
    } catch (error) {
      console.error('Error getting user purchase stats:', error);
      throw new Error('Error al obtener estadísticas de compras');
    }
  }
}
