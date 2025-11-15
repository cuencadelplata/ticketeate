import { prisma } from '../config/prisma';

export class ScannerService {
  /**
   * Obtiene las estadísticas de tickets para un evento (solo para colaboradores asignados)
   */
  static async getTicketStats(eventoid: string, usuarioid: string) {
    try {
      // Verificar que el usuario es colaborador del evento
      const colaborador = await prisma.colaborador_eventos.findFirst({
        where: {
          eventoid,
          usuarioid,
        },
      });

      if (!colaborador) {
        throw new Error('No tienes acceso a este evento como colaborador');
      }

      // Obtener todas las entradas del evento
      const entradas = await prisma.entradas.findMany({
        where: {
          reservas: {
            eventoid,
          },
        },
      });

      const total = entradas.length;
      const scanned = entradas.filter((e) => e.estado === 'USADA').length;
      const pending = total - scanned;

      return {
        total,
        scanned,
        pending,
        percentage: total > 0 ? Math.round((scanned / total) * 100) : 0,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting ticket stats:', error);
      throw error;
    }
  }

  /**
   * Escanea un ticket (marca como usado)
   */
  static async scanTicket(eventoid: string, codigoQr: string, usuarioid: string) {
    try {
      // Verificar que el usuario es colaborador del evento
      const colaborador = await prisma.colaborador_eventos.findFirst({
        where: {
          eventoid,
          usuarioid,
        },
      });

      if (!colaborador) {
        throw new Error('No tienes acceso a este evento como colaborador');
      }

      // Buscar la entrada por código QR
      const entrada = await prisma.entradas.findUnique({
        where: { codigo_qr: codigoQr },
        include: {
          reservas: {
            select: { eventoid: true },
          },
        },
      });

      if (!entrada) {
        throw new Error('Código QR no encontrado');
      }

      // Verificar que la entrada pertenece al evento correcto
      if (entrada.reservas?.eventoid !== eventoid) {
        throw new Error('Esta entrada no pertenece al evento');
      }

      // Verificar si ya fue escaneada
      if (entrada.estado === 'USADA') {
        throw new Error('Esta entrada ya fue escaneada');
      }

      if (entrada.estado === 'CANCELADA') {
        throw new Error('Esta entrada fue cancelada');
      }

      // Marcar como usada
      const entradaActualizada = await prisma.entradas.update({
        where: { entradaid: entrada.entradaid },
        data: {
          estado: 'USADA',
          updated_by: usuarioid,
        },
      });

      return {
        success: true,
        entradaid: entradaActualizada.entradaid,
        codigo_qr: entradaActualizada.codigo_qr,
        estado: entradaActualizada.estado,
        message: 'Ticket escaneado correctamente',
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error scanning ticket:', error);
      throw error;
    }
  }

  /**
   * Obtiene las entradas de un evento filtradas por estado
   */
  static async getEventoEntradas(
    eventoid: string,
    usuarioid: string,
    estado?: 'VALIDA' | 'USADA' | 'CANCELADA',
  ) {
    try {
      // Verificar que el usuario es colaborador del evento
      const colaborador = await prisma.colaborador_eventos.findFirst({
        where: {
          eventoid,
          usuarioid,
        },
      });

      if (!colaborador) {
        throw new Error('No tienes acceso a este evento como colaborador');
      }

      const where: Record<string, unknown> = {
        reservas: {
          eventoid,
        },
      };

      if (estado) {
        where.estado = estado;
      }

      const entradas = await prisma.entradas.findMany({
        where,
        select: {
          entradaid: true,
          codigo_qr: true,
          estado: true,
          reservas: {
            select: {
              usuarioid: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          updated_at: 'desc', // Ordenar por más recientes
        },
      });

      return entradas.map((entrada) => ({
        entradaid: entrada.entradaid,
        codigo_qr: entrada.codigo_qr,
        estado: entrada.estado,
        usuario: entrada.reservas?.user,
      }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting entradas:', error);
      throw error;
    }
  }

  /**
   * Obtiene un resumen de actividad del scanner
   */
  static async getScannerActivity(eventoid: string, usuarioid: string) {
    try {
      // Verificar que el usuario es colaborador del evento
      const colaborador = await prisma.colaborador_eventos.findFirst({
        where: {
          eventoid,
          usuarioid,
        },
      });

      if (!colaborador) {
        throw new Error('No tienes acceso a este evento como colaborador');
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Obtener entradas escaneadas hoy
      const escaneadasHoy = await prisma.entradas.count({
        where: {
          reservas: {
            eventoid,
          },
          estado: 'USADA',
          updated_at: {
            gte: hoy,
          },
        },
      });

      // Obtener estadísticas generales
      const stats = await this.getTicketStats(eventoid, usuarioid);

      return {
        ...stats,
        scanned_today: escaneadasHoy,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting scanner activity:', error);
      throw error;
    }
  }
}
