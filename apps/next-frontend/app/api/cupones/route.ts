import { NextRequest, NextResponse } from 'next/server';
import { prisma, change_type } from '@repo/db';
import { auth } from '@/lib/auth';

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
    // Esto incluye deletes, updates y creaciones
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

    console.log('[Cupones API POST] Datos recibidos:', {
      eventId,
      codigo,
      porcentaje_descuento,
      fecha_expiracion,
      limite_usos,
      types: {
        porcentaje_descuento: typeof porcentaje_descuento,
        limite_usos: typeof limite_usos,
        fecha_expiracion: typeof fecha_expiracion,
      },
    });

    // Convertir valores a números si es necesario
    const porcentajeNumero =
      typeof porcentaje_descuento === 'string'
        ? parseFloat(porcentaje_descuento)
        : porcentaje_descuento;
    const limitesNumero = typeof limite_usos === 'string' ? parseInt(limite_usos, 10) : limite_usos;

    // Validar y convertir fecha
    let fechaExpiracion: Date;
    try {
      fechaExpiracion = new Date(fecha_expiracion);
      if (isNaN(fechaExpiracion.getTime())) {
        throw new Error('Fecha inválida');
      }
    } catch {
      return NextResponse.json(
        {
          error: 'fecha_expiracion inválida. Debe ser una fecha válida en formato ISO o YYYY-MM-DD',
          received: fecha_expiracion,
        },
        { status: 400 },
      );
    }

    // Validar campos requeridos (sin usar operadores falsy que fallan con 0)
    if (
      !eventId ||
      !codigo ||
      porcentajeNumero === undefined ||
      porcentajeNumero === null ||
      isNaN(porcentajeNumero) ||
      !fecha_expiracion ||
      limitesNumero === undefined ||
      limitesNumero === null ||
      isNaN(limitesNumero)
    ) {
      console.error('[Cupones API POST] Validación fallida:', {
        eventId: !!eventId,
        codigo: !!codigo,
        porcentajeNumero,
        fecha_expiracion: !!fecha_expiracion,
        limitesNumero,
      });
      return NextResponse.json(
        {
          error: 'Faltan campos requeridos o tienen tipos inválidos',
          received: {
            eventId,
            codigo,
            porcentaje_descuento,
            fecha_expiracion,
            limite_usos,
          },
          parsed: {
            porcentajeNumero,
            limitesNumero,
          },
        },
        { status: 400 },
      );
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
        codigo: codigo.toUpperCase(),
        porcentaje_descuento: porcentajeNumero,
        fecha_expiracion: fechaExpiracion,
        limite_usos: limitesNumero,
        estado: 'ACTIVO',
        updated_by: session.user.id,
        // usos_actuales y is_active tienen valores por defecto en el schema
      },
    });

    return NextResponse.json({ cupon }, { status: 201 });
  } catch (error) {
    console.error('Error al crear cupón:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorDetails =
      error instanceof Error ? { message: error.message, stack: error.stack } : error;
    return NextResponse.json(
      { error: 'Error al crear cupón', details: errorDetails },
      { status: 500 },
    );
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
        codigo: (updateData.codigo ?? currentCupon.codigo).toUpperCase(),
        porcentaje_descuento:
          updateData.porcentaje_descuento !== undefined
            ? parseFloat(String(updateData.porcentaje_descuento))
            : currentCupon.porcentaje_descuento,
        fecha_creacion: currentCupon.fecha_creacion,
        fecha_expiracion: updateData.fecha_expiracion
          ? new Date(updateData.fecha_expiracion)
          : currentCupon.fecha_expiracion,
        limite_usos:
          updateData.limite_usos !== undefined
            ? parseInt(String(updateData.limite_usos), 10)
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
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al actualizar cupón', details: errorMessage },
      { status: 500 },
    );
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
