import { prisma } from '../config/prisma';

export interface PurchaseDetails {
  id: string;
  eventId: string;
  eventName: string;
  eventImage?: string;
  gallery?: string[];
  category: string;
  date: string;
  time: string;
  venue: string;
  address?: string;
  description?: string;
  ticketCount: number;
  ticketType: string;
  totalPrice: number;
  currency: string;
  status: string;
  purchaseDate: string;
  orderId: string;
  tickets: Array<{
    id: string;
    qrCode: string;
    validated: boolean;
  }>;
}

export class PurchasesService {
  /**
   * Get user's purchase history with pagination and filtering
   */
  static async getUserPurchaseHistory(
    userId: string,
    page: number = 1,
    limit: number = 12,
    status?: string,
    search?: string,
  ) {
    try {
      const offset = (page - 1) * limit;

      let whereClause = `WHERE hc.usuarioid = '${userId}'`;
      if (status) {
        whereClause += ` AND hc.estado_compra = '${status}'`;
      }
      if (search) {
        whereClause += ` AND (e.titulo ILIKE '%${search}%' OR e.ubicacion ILIKE '%${search}%')`;
      }

      const countResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count
        FROM historial_compras hc
        LEFT JOIN eventos e ON hc.eventoid = e.eventoid
        ${whereClause as any}
      `;

      const total = Number(countResult[0]?.count || 0);

      const purchases = await prisma.historial_compras.findMany({
        where: {
          usuarioid: userId,
          ...(status && { estado_compra: status }),
        },
        include: {
          eventos: {
            select: {
              titulo: true,
              imagenes_evento: {
                where: { tipo: 'PORTADA' },
                select: { url: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { fecha_compra: 'desc' },
        skip: offset,
        take: limit,
      });

      return {
        success: true,
        purchases: purchases.map((p) => ({
          id: p.id,
          eventId: p.eventoid,
          eventName: p.eventos.titulo,
          eventImage: p.eventos.imagenes_evento[0]?.url,
          category: 'Música',
          date: p.fecha_evento.toISOString().split('T')[0],
          ticketCount: p.cantidad,
          ticketType: 'General',
          totalPrice: Number(p.monto_total),
          currency: p.moneda,
          status: p.estado_compra,
          purchaseDate: p.fecha_compra.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      throw error;
    }
  }

  /**
   * Get detailed purchase information
   */
  static async getPurchaseDetails(purchaseId: string): Promise<PurchaseDetails | null> {
    try {
      const purchase = await prisma.historial_compras.findUnique({
        where: { id: purchaseId },
        include: {
          eventos: {
            select: {
              eventoid: true,
              titulo: true,
              ubicacion: true,
              descripcion: true,
              imagenes_evento: {
                select: { url: true },
                take: 5,
              },
            },
          },
          reservas: {
            select: {
              cantidad: true,
              estado: true,
              fechas_evento: {
                select: { fecha_hora: true },
              },
              entradas: {
                select: {
                  entradaid: true,
                  codigo_qr: true,
                  estado: true,
                },
              },
            },
          },
        },
      });

      if (!purchase) {
        return null;
      }

      const eventDate = purchase.reservas.fechas_evento.fecha_hora;

      return {
        id: purchase.id,
        eventId: purchase.eventoid,
        eventName: purchase.eventos.titulo,
        eventImage: purchase.eventos.imagenes_evento[0]?.url,
        gallery: purchase.eventos.imagenes_evento.map((img) => img.url),
        category: 'Música',
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toISOString().split('T')[1]?.split('.')[0] || '00:00',
        venue: purchase.eventos.ubicacion,
        address: purchase.eventos.ubicacion,
        description: purchase.eventos.descripcion || '',
        ticketCount: purchase.cantidad,
        ticketType: 'General',
        totalPrice: Number(purchase.monto_total),
        currency: purchase.moneda,
        status: purchase.estado_compra,
        purchaseDate: purchase.fecha_compra.toISOString(),
        orderId: `ORD-${purchase.id.substring(0, 8).toUpperCase()}`,
        tickets: purchase.reservas.entradas.map((t) => ({
          id: t.entradaid,
          qrCode: t.codigo_qr,
          validated: t.estado === 'USADA',
        })),
      };
    } catch (error) {
      console.error('Error fetching purchase details:', error);
      throw error;
    }
  }

  /**
   * Get purchase statistics for a user
   */
  static async getUserPurchaseStats(userId: string) {
    try {
      const purchases = await prisma.historial_compras.findMany({
        where: { usuarioid: userId },
        select: {
          monto_total: true,
          moneda: true,
          estado_compra: true,
        },
      });

      const stats = {
        totalPurchases: purchases.length,
        totalSpent: 0,
        completedPurchases: 0,
        pendingPurchases: 0,
        currency: 'USD',
      };

      purchases.forEach((p) => {
        stats.totalSpent += Number(p.monto_total);
        stats.currency = p.moneda;
        if (p.estado_compra === 'completed') stats.completedPurchases++;
        if (p.estado_compra === 'pending') stats.pendingPurchases++;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching purchase stats:', error);
      throw error;
    }
  }
}
