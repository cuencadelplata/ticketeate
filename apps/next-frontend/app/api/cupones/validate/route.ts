import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { auth } from '@/lib/auth';

// POST - Validar y aplicar un cupón
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { codigo, eventId } = body;

    if (!codigo || !eventId) {
      return NextResponse.json({ error: 'Código y eventId son requeridos' }, { status: 400 });
    }

    // Buscar cupón en la tabla principal (cupones_evento)
    const cupon = await prisma.cupones_evento.findFirst({
      where: {
        eventoid: eventId,
        codigo: {
          equals: codigo,
          mode: 'insensitive', // Case-insensitive
        },
        is_active: true,
      },
    });

    if (!cupon) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
    }

    // Validar estado
    if (cupon.estado !== 'ACTIVO') {
      return NextResponse.json({ error: 'Cupón inactivo' }, { status: 400 });
    }

    // Validar fecha de expiración
    const now = new Date();
    const expiracion = new Date(cupon.fecha_expiracion);
    if (expiracion < now) {
      return NextResponse.json({ error: 'Cupón expirado' }, { status: 400 });
    }

    // Validar límite de usos
    if (cupon.usos_actuales >= cupon.limite_usos) {
      return NextResponse.json({ error: 'Cupón alcanzó el límite de usos' }, { status: 400 });
    }

    // Verificar si el usuario ya usó este cupón para este evento
    const yaUsado = await prisma.cupones_redimidos.findFirst({
      where: {
        cuponid: cupon.cuponid,
        eventoid: eventId,
        usuarioid: session.user.id,
      },
    });

    if (yaUsado) {
      return NextResponse.json({ error: 'Ya has usado este cupón anteriormente' }, { status: 400 });
    }

    // Cupón válido - devolver información
    return NextResponse.json(
      {
        valid: true,
        cupon: {
          cuponid: cupon.cuponid,
          codigo: cupon.codigo,
          porcentaje_descuento: parseFloat(cupon.porcentaje_descuento.toString()),
          fecha_expiracion: cupon.fecha_expiracion,
          usos_disponibles: cupon.limite_usos - cupon.usos_actuales,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error al validar cupón:', error);
    return NextResponse.json({ error: 'Error al validar cupón' }, { status: 500 });
  }
}
