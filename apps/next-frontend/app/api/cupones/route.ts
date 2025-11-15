import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { auth } from '@/lib/auth';

const change_type = {
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

// GET - Obtener cupones de un evento
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ error: 'eventId es requerido' }, { status: 400 });
    }

    // Verificar que el usuario es el creador del evento
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { creadorid: true },
    });

    if (!event || event.creadorid !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para ver los cupones de este evento' },
        { status: 403 },
      );
    }

    // Obtener la última versión de cada cupón desde el historial (append-only)
    const cuponesHistory = await prisma.$queryRaw<any[]>`
      WITH latest_versions AS (
        SELECT DISTINCT ON (cuponid)
          cuponid,
          eventoid,
          codigo,
          porcentaje_descuento,
          fecha_creacion,
          fecha_expiracion,
          limite_usos,
          usos_actuales,
          estado,
          version,
          changed_at,
          changed_by,
          change_type
        FROM cupones_evento_history
        WHERE eventoid::text = ${eventId}
        ORDER BY cuponid, version DESC, changed_at DESC
      )
      SELECT * FROM latest_versions
      WHERE change_type::text != 'DELETE'
      ORDER BY fecha_creacion DESC
    `;

    return NextResponse.json({ cupones: cuponesHistory }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener cupones:', error);
    return NextResponse.json({ error: 'Error al obtener cupones' }, { status: 500 });
  }
}

// POST - Crear un nuevo cupón
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, codigo, porcentaje_descuento, fecha_expiracion, limite_usos } = body;

    if (!eventId || !codigo || !porcentaje_descuento || !fecha_expiracion || !limite_usos) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Verificar que el usuario es el creador del evento
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { creadorid: true },
    });

    if (!event || event.creadorid !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para crear cupones en este evento' },
        { status: 403 },
      );
    }

    // Verificar que el código no exista ya para este evento
    const existingCupon = await prisma.cupones_evento.findFirst({
      where: {
        eventoid: eventId,
        codigo: codigo,
        is_active: true,
      },
    });

    if (existingCupon) {
      return NextResponse.json(
        { error: 'Ya existe un cupón con este código para este evento' },
        { status: 400 },
      );
    }

    const cupon = await prisma.cupones_evento.create({
      data: {
        eventoid: eventId,
        codigo: codigo,
        porcentaje_descuento: Number(porcentaje_descuento),
        fecha_expiracion: new Date(fecha_expiracion),
        limite_usos: Number(limite_usos),
        estado: 'ACTIVO',
        updated_by: session.user.id,
      },
    });

    return NextResponse.json({ cupon }, { status: 201 });
  } catch (error) {
    console.error('Error al crear cupón:', error);
    return NextResponse.json({ error: 'Error al crear cupón' }, { status: 500 });
  }
}

// PATCH - Actualizar un cupón
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { cuponId, eventId, ...updateData } = body;

    if (!cuponId || !eventId) {
      return NextResponse.json({ error: 'cuponId y eventId son requeridos' }, { status: 400 });
    }

    // Verificar que el usuario es el creador del evento
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { creadorid: true },
    });

    if (!event || event.creadorid !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para actualizar cupones en este evento' },
        { status: 403 },
      );
    }

    // Obtener el cupón actual
    const currentCupon = await prisma.cupones_evento.findUnique({
      where: { cuponid: cuponId },
    });

    if (!currentCupon || currentCupon.eventoid !== eventId) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
    }

    // Si se está cambiando el código, verificar que no exista ya
    if (updateData.codigo && updateData.codigo !== currentCupon.codigo) {
      const existingCupon = await prisma.cupones_evento.findFirst({
        where: {
          eventoid: eventId,
          codigo: updateData.codigo,
          is_active: true,
          cuponid: { not: cuponId },
        },
      });

      if (existingCupon) {
        return NextResponse.json(
          { error: 'Ya existe un cupón con este código para este evento' },
          { status: 400 },
        );
      }
    }

    // Registrar en el historial (append-only)
    const cupon = await prisma.cupones_evento_history.create({
      data: {
        cuponid: cuponId,
        eventoid: currentCupon.eventoid,
        codigo: updateData.codigo ?? currentCupon.codigo,
        porcentaje_descuento:
          updateData.porcentaje_descuento !== undefined
            ? Number(updateData.porcentaje_descuento)
            : currentCupon.porcentaje_descuento,
        fecha_creacion: currentCupon.fecha_creacion,
        fecha_expiracion: updateData.fecha_expiracion
          ? new Date(updateData.fecha_expiracion)
          : currentCupon.fecha_expiracion,
        limite_usos:
          updateData.limite_usos !== undefined
            ? Number(updateData.limite_usos)
            : currentCupon.limite_usos,
        usos_actuales: currentCupon.usos_actuales,
        estado: updateData.estado ?? currentCupon.estado,
        version: currentCupon.version + 1,
        changed_by: session.user.id,
        change_type: change_type.UPDATE,
      },
    });

    return NextResponse.json({ cupon }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar cupón:', error);
    return NextResponse.json({ error: 'Error al actualizar cupón' }, { status: 500 });
  }
}

// DELETE - Eliminar un cupón (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cuponId = searchParams.get('cuponId');
    const eventId = searchParams.get('eventId');

    if (!cuponId || !eventId) {
      return NextResponse.json({ error: 'cuponId y eventId son requeridos' }, { status: 400 });
    }

    // Verificar que el usuario es el creador del evento
    const event = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { creadorid: true },
    });

    if (!event || event.creadorid !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar cupones en este evento' },
        { status: 403 },
      );
    }

    // Obtener el cupón actual
    const currentCupon = await prisma.cupones_evento.findUnique({
      where: { cuponid: cuponId },
    });

    if (!currentCupon || currentCupon.eventoid !== eventId) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
    }

    // Registrar la eliminación en el historial (append-only)
    const cupon = await prisma.cupones_evento_history.create({
      data: {
        cuponid: cuponId,
        eventoid: currentCupon.eventoid,
        codigo: currentCupon.codigo,
        porcentaje_descuento: currentCupon.porcentaje_descuento,
        fecha_creacion: currentCupon.fecha_creacion,
        fecha_expiracion: currentCupon.fecha_expiracion,
        limite_usos: currentCupon.limite_usos,
        usos_actuales: currentCupon.usos_actuales,
        estado: 'INACTIVO',
        version: currentCupon.version + 1,
        changed_by: session.user.id,
        change_type: change_type.DELETE,
      },
    });

    return NextResponse.json({ cupon }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar cupón:', error);
    return NextResponse.json({ error: 'Error al eliminar cupón' }, { status: 500 });
  }
}
