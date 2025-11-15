import { prisma } from '../config/prisma';
import { randomUUID } from 'node:crypto';
import { logger } from '../logger';

export interface CreateInviteCodeData {
  eventoid: string;
  creadorid: string;
  codigo?: string; // Si no se proporciona, se genera aleatorio
  fecha_expiracion?: Date;
  usos_max?: number;
}

export interface InviteCodeResponse {
  codigoid: string;
  eventoid: string;
  codigo: string;
  estado: string;
  fecha_creacion: Date;
  fecha_expiracion: Date;
  usos_totales: number;
  usos_max: number;
}

export class InviteCodeService {
  /**
   * Genera un código aleatorio de 8 caracteres (letras mayúsculas + números)
   */
  private static generateRandomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Crea un nuevo código de invitación
   */
  static async createInviteCode(data: CreateInviteCodeData): Promise<InviteCodeResponse> {
    try {
      // Verificar que el evento existe y que el usuario es el creador
      const evento = await prisma.eventos.findUnique({
        where: { eventoid: data.eventoid },
      });

      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      if (evento.creadorid !== data.creadorid) {
        throw new Error('Solo el creador del evento puede generar códigos de invitación');
      }

      // Generar código si no se proporciona
      const codigo = data.codigo || this.generateRandomCode();

      // Verificar que el código no exista ya para este evento
      const codigoExistente = await prisma.invite_codes.findFirst({
        where: {
          eventoid: data.eventoid,
          codigo,
        },
      });

      if (codigoExistente) {
        throw new Error('Este código de invitación ya existe para este evento');
      }

      // Crear el código de invitación
      const inviteCode = await prisma.invite_codes.create({
        data: {
          codigoid: randomUUID(),
          eventoid: data.eventoid,
          codigo,
          estado: 'ACTIVO',
          fecha_creacion: new Date(),
          fecha_expiracion:
            data.fecha_expiracion || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
          usos_totales: 0,
          usos_max: data.usos_max || 999999,
          creador_id: data.creadorid,
        },
      });

      return {
        codigoid: inviteCode.codigoid,
        eventoid: inviteCode.eventoid,
        codigo: inviteCode.codigo,
        estado: inviteCode.estado,
        fecha_creacion: inviteCode.fecha_creacion,
        fecha_expiracion: inviteCode.fecha_expiracion,
        usos_totales: inviteCode.usos_totales,
        usos_max: inviteCode.usos_max,
      };
    } catch (error) {
      logger.error('Error creating invite code', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Obtiene todos los códigos de invitación para un evento
   */
  static async getInviteCodesByEvent(eventoid: string, creadorid: string) {
    try {
      // Verificar que el usuario es el creador del evento
      const evento = await prisma.eventos.findUnique({
        where: { eventoid },
      });

      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      if (evento.creadorid !== creadorid) {
        throw new Error('Solo el creador del evento puede ver sus códigos de invitación');
      }

      const codes = await prisma.invite_codes.findMany({
        where: { eventoid },
        orderBy: { fecha_creacion: 'desc' },
      });

      return codes.map((code) => ({
        codigoid: code.codigoid,
        eventoid: code.eventoid,
        codigo: code.codigo,
        estado: code.estado,
        fecha_creacion: code.fecha_creacion,
        fecha_expiracion: code.fecha_expiracion,
        usos_totales: code.usos_totales,
        usos_max: code.usos_max,
      }));
    } catch (error) {
      logger.error('Error getting invite codes', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Valida un código de invitación y retorna información del evento asociado
   */
  static async validateInviteCode(codigo: string) {
    try {
      const inviteCode = await prisma.invite_codes.findFirst({
        where: { codigo },
        include: {
          eventos: {
            select: {
              eventoid: true,
              titulo: true,
              descripcion: true,
              ubicacion: true,
            },
          },
        },
      });

      if (!inviteCode) {
        throw new Error('Código de invitación no válido');
      }

      // Verificar que el código está activo
      if (inviteCode.estado !== 'ACTIVO') {
        throw new Error('Código de invitación inactivo');
      }

      // Verificar que no ha expirado
      if (new Date() > inviteCode.fecha_expiracion) {
        throw new Error('Código de invitación expirado');
      }

      // Verificar que no ha alcanzado el límite de usos
      if (inviteCode.usos_totales >= inviteCode.usos_max) {
        throw new Error('Código de invitación alcanzó el límite de usos');
      }

      return {
        codigoid: inviteCode.codigoid,
        codigo: inviteCode.codigo,
        eventoid: inviteCode.eventoid,
        eventoTitulo: inviteCode.eventos?.titulo,
        eventoDescripcion: inviteCode.eventos?.descripcion,
        eventoUbicacion: inviteCode.eventos?.ubicacion,
        estado: inviteCode.estado,
        usos_totales: inviteCode.usos_totales,
        usos_max: inviteCode.usos_max,
        fecha_expiracion: inviteCode.fecha_expiracion,
      };
    } catch (error) {
      logger.error('Error validating invite code', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Usa un código de invitación (incrementa el contador de usos y vincula colaborador al evento)
   */
  static async useInviteCode(
    codigo: string,
    usuarioid: string,
  ): Promise<{ eventoid: string; colaboradorEventoId: string }> {
    try {
      // Validar el código
      const inviteCode = await prisma.invite_codes.findFirst({
        where: { codigo },
      });

      if (!inviteCode) {
        throw new Error('Código de invitación no válido');
      }

      if (inviteCode.estado !== 'ACTIVO') {
        throw new Error('Código de invitación inactivo');
      }

      if (new Date() > inviteCode.fecha_expiracion) {
        throw new Error('Código de invitación expirado');
      }

      if (inviteCode.usos_totales >= inviteCode.usos_max) {
        throw new Error('Código de invitación alcanzó el límite de usos');
      }

      // Verificar que el usuario no está ya vinculado a este evento como colaborador
      const colaboradorExistente = await prisma.colaborador_eventos.findFirst({
        where: {
          eventoid: inviteCode.eventoid,
          usuarioid,
        },
      });

      if (colaboradorExistente) {
        throw new Error('Ya eres un colaborador de este evento');
      }

      // Usar el código de invitación en una transacción
      const result = await prisma.$transaction(async (tx) => {
        // Incrementar el contador de usos
        await tx.invite_codes.update({
          where: { codigoid: inviteCode.codigoid },
          data: { usos_totales: inviteCode.usos_totales + 1 },
        });

        // Crear la relación colaborador-evento
        const colaboradorEvento = await tx.colaborador_eventos.create({
          data: {
            eventoid: inviteCode.eventoid,
            usuarioid,
            invite_code_used: codigo,
            fecha_asignacion: new Date(),
          },
        });

        return colaboradorEvento;
      });

      return {
        eventoid: inviteCode.eventoid,
        colaboradorEventoId: result.colaborador_evento_id,
      };
    } catch (error) {
      logger.error('Error using invite code', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Desactiva un código de invitación
   */
  static async deactivateInviteCode(codigoid: string, creadorid: string) {
    try {
      const inviteCode = await prisma.invite_codes.findUnique({
        where: { codigoid },
      });

      if (!inviteCode) {
        throw new Error('Código de invitación no encontrado');
      }

      // Verificar que el usuario es el creador del evento
      const evento = await prisma.eventos.findUnique({
        where: { eventoid: inviteCode.eventoid },
      });

      if (evento?.creadorid !== creadorid) {
        throw new Error('Solo el creador del evento puede desactivar códigos de invitación');
      }

      const updated = await prisma.invite_codes.update({
        where: { codigoid },
        data: { estado: 'INACTIVO' },
      });

      return {
        codigoid: updated.codigoid,
        codigo: updated.codigo,
        estado: updated.estado,
      };
    } catch (error) {
      logger.error('Error deactivating invite code', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Obtiene los colaboradores de un evento
   */
  static async getColaboradorsByEvent(eventoid: string, creadorid: string) {
    try {
      // Verificar que el usuario es el creador del evento
      const evento = await prisma.eventos.findUnique({
        where: { eventoid },
      });

      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      if (evento.creadorid !== creadorid) {
        throw new Error('Solo el creador del evento puede ver sus colaboradores');
      }

      const colaboradores = await prisma.colaborador_eventos.findMany({
        where: { eventoid },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { fecha_asignacion: 'desc' },
      });

      return colaboradores.map((col) => ({
        colaborador_evento_id: col.colaborador_evento_id,
        eventoid: col.eventoid,
        usuarioid: col.usuarioid,
        usuario: col.user,
        invite_code_used: col.invite_code_used,
        fecha_asignacion: col.fecha_asignacion,
      }));
    } catch (error) {
      logger.error('Error getting colaboradores', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Obtiene el evento asignado a un colaborador
   */
  static async getEventoByColaborador(usuarioid: string) {
    try {
      const colaboradorEventos = await prisma.colaborador_eventos.findMany({
        where: { usuarioid },
        include: {
          eventos: {
            select: {
              eventoid: true,
              titulo: true,
              descripcion: true,
              ubicacion: true,
              creadorid: true,
            },
          },
        },
      });

      if (colaboradorEventos.length === 0) {
        throw new Error('No hay evento asignado para este colaborador');
      }

      // Retornar el primer evento (si tiene múltiples, devolver todos)
      return colaboradorEventos.map((col) => ({
        colaborador_evento_id: col.colaborador_evento_id,
        eventoid: col.eventoid,
        evento: col.eventos,
        fecha_asignacion: col.fecha_asignacion,
      }));
    } catch (error) {
      logger.error('Error getting evento by colaborador', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
