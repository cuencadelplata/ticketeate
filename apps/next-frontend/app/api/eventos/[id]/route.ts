import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';
import { randomUUID } from 'crypto';

/**
 * GET /api/eventos/[id]
 * Obtiene información detallada de un evento específico (admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: eventId } = await params;

    // Obtener información completa del evento
    const evento = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      include: {
        stock_entrada: true,
        fechas_evento: true,
        imagenes_evento: true,
        evento_estado: {
          orderBy: { fecha_de_cambio: 'desc' },
          take: 1,
        },
        evento_modificaciones: {
          orderBy: { fecha_modificacion: 'desc' },
          take: 10,
        },
        evento_categorias: {
          include: {
            categoriaevento: true,
          },
        },
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario sea el creador del evento
    if (evento.creadorid !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para acceder a este evento' },
        { status: 403 },
      );
    }

    return NextResponse.json({ event: evento }, { status: 200 });
  } catch (error) {
    console.error('[EVENTOS GET] Error obteniendo evento:', error);
    return NextResponse.json({ error: 'Error al obtener evento' }, { status: 500 });
  }
}

/**
 * PUT /api/eventos/[id]
 * Actualiza un evento (soft update con registro de modificaciones)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: eventId } = await params;
    const body = await request.json();
    const { titulo, descripcion, ubicacion, estado } = body;

    // Obtener el evento actual para comparar cambios
    const eventoActual = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      include: {
        evento_estado: {
          orderBy: { fecha_de_cambio: 'desc' },
          take: 1,
        },
      },
    });

    if (!eventoActual) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario sea el creador del evento
    if (eventoActual.creadorid !== userId) {
      return NextResponse.json({ error: 'No autorizado para editar este evento' }, { status: 403 });
    }

    // Validar que al menos un campo esté siendo actualizado
    const camposActualizar: any = {};
    const camposModificados: Array<{
      campo: string;
      valorAnterior: string | null;
      valorNuevo: string | null;
    }> = [];

    if (titulo !== undefined && titulo !== eventoActual.titulo) {
      camposActualizar.titulo = titulo;
      camposModificados.push({
        campo: 'titulo',
        valorAnterior: eventoActual.titulo,
        valorNuevo: titulo,
      });
    }

    if (descripcion !== undefined && descripcion !== eventoActual.descripcion) {
      camposActualizar.descripcion = descripcion;
      camposModificados.push({
        campo: 'descripcion',
        valorAnterior: eventoActual.descripcion,
        valorNuevo: descripcion,
      });
    }

    if (ubicacion !== undefined && ubicacion !== eventoActual.ubicacion) {
      camposActualizar.ubicacion = ubicacion;
      camposModificados.push({
        campo: 'ubicacion',
        valorAnterior: eventoActual.ubicacion,
        valorNuevo: ubicacion,
      });
    }

    // Actualizar estado si se proporciona
    if (estado !== undefined && estado !== eventoActual.evento_estado?.[0]?.Estado) {
      const estadoValido = ['ACTIVO', 'CANCELADO', 'COMPLETADO', 'OCULTO'].includes(estado);
      if (!estadoValido) {
        return NextResponse.json(
          { error: 'Estado inválido. Debe ser: ACTIVO, CANCELADO, COMPLETADO u OCULTO' },
          { status: 400 },
        );
      }

      camposModificados.push({
        campo: 'estado',
        valorAnterior: eventoActual.evento_estado?.[0]?.Estado || 'OCULTO',
        valorNuevo: estado,
      });
    }

    // Si no hay cambios, retornar el evento sin modificar
    if (Object.keys(camposActualizar).length === 0 && !estado) {
      return NextResponse.json(
        { event: eventoActual, message: 'No hay cambios para actualizar' },
        { status: 200 },
      );
    }

    // Actualizar el evento
    camposActualizar.fecha_cambio = new Date();
    camposActualizar.version = (eventoActual.version || 1) + 1;
    camposActualizar.updated_by = userId;

    await prisma.eventos.update({
      where: { eventoid: eventId },
      data: camposActualizar,
      include: {
        stock_entrada: true,
        fechas_evento: true,
        imagenes_evento: true,
        evento_estado: {
          orderBy: { fecha_de_cambio: 'desc' },
          take: 1,
        },
        evento_categorias: {
          include: {
            categoriaevento: true,
          },
        },
      },
    });

    // Registrar los cambios en evento_modificaciones
    if (camposModificados.length > 0) {
      await Promise.all(
        camposModificados.map((mod) =>
          prisma.evento_modificaciones.create({
            data: {
              modificacionid: randomUUID(),
              eventoid: eventId,
              campo_modificado: mod.campo,
              valor_anterior: mod.valorAnterior,
              valor_nuevo: mod.valorNuevo,
              usuarioid: userId,
              fecha_modificacion: new Date(),
            },
          }),
        ),
      );
    }

    // Actualizar estado del evento si se proporciona
    if (estado) {
      await prisma.evento_estado.create({
        data: {
          stateventid: randomUUID(),
          eventoid: eventId,
          Estado: estado,
          usuarioid: userId,
          fecha_de_cambio: new Date(),
        },
      });
    }

    // Obtener el evento actualizado con todas sus relaciones
    const eventoConRelaciones = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      include: {
        stock_entrada: true,
        fechas_evento: true,
        imagenes_evento: true,
        evento_estado: {
          orderBy: { fecha_de_cambio: 'desc' },
          take: 1,
        },
        evento_modificaciones: {
          orderBy: { fecha_modificacion: 'desc' },
          take: 10,
        },
        evento_categorias: {
          include: {
            categoriaevento: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        event: eventoConRelaciones,
        message: 'Evento actualizado correctamente',
        modificaciones: camposModificados,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[EVENTOS PUT] Error actualizando evento:', error);
    return NextResponse.json({ error: 'Error al actualizar evento' }, { status: 500 });
  }
}

/**
 * DELETE /api/eventos/[id]
 * Elimina un evento (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: eventId } = await params;

    // Obtener el evento actual
    const evento = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
    });

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario sea el creador del evento
    if (evento.creadorid !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para eliminar este evento' },
        { status: 403 },
      );
    }

    // Realizar soft delete
    await prisma.eventos.update({
      where: { eventoid: eventId },
      data: {
        deleted_at: new Date(),
        is_active: false,
        updated_by: userId,
        version: (evento.version || 1) + 1,
      },
    });

    // Registrar la eliminación en evento_modificaciones
    await prisma.evento_modificaciones.create({
      data: {
        modificacionid: randomUUID(),
        eventoid: eventId,
        campo_modificado: 'estado',
        valor_anterior: 'ACTIVO',
        valor_nuevo: 'ELIMINADO',
        usuarioid: userId,
        fecha_modificacion: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: 'Evento eliminado correctamente',
        eventoid: eventId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[EVENTOS DELETE] Error eliminando evento:', error);
    return NextResponse.json({ error: 'Error al eliminar evento' }, { status: 500 });
  }
}
