import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
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

    const cupones = await prisma.cupones_evento.findMany({
      where: {
        eventoid: eventId,
        is_active: true,
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return NextResponse.json({ cupones }, { status: 200 });
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
        porcentaje_descuento: porcentaje_descuento,
        fecha_expiracion: new Date(fecha_expiracion),
        limite_usos: limite_usos,
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

    const prismaUpdateData: any = {
      updated_by: session.user.id,
      version: { increment: 1 },
    };

    if (updateData.codigo) prismaUpdateData.codigo = updateData.codigo;
    if (updateData.porcentaje_descuento !== undefined)
      prismaUpdateData.porcentaje_descuento = updateData.porcentaje_descuento;
    if (updateData.fecha_expiracion)
      prismaUpdateData.fecha_expiracion = new Date(updateData.fecha_expiracion);
    if (updateData.limite_usos !== undefined) prismaUpdateData.limite_usos = updateData.limite_usos;
    if (updateData.estado) prismaUpdateData.estado = updateData.estado;

    const cupon = await prisma.cupones_evento.update({
      where: { cuponid: cuponId },
      data: prismaUpdateData,
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

    const cupon = await prisma.cupones_evento.update({
      where: { cuponid: cuponId },
      data: {
        is_active: false,
        deleted_at: new Date(),
        updated_by: session.user.id,
        version: { increment: 1 },
      },
    });

    return NextResponse.json({ cupon }, { status: 200 });
  } catch (error) {
    console.error('Error al eliminar cupón:', error);
    return NextResponse.json({ error: 'Error al eliminar cupón' }, { status: 500 });
  }
}
