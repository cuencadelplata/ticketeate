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

    // Obtener la última versión del cupón desde el historial (append-only)
    const latestCupon = await prisma.$queryRaw<any[]>`
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
        AND UPPER(codigo) = UPPER(${codigo})
      ORDER BY cuponid, version DESC, changed_at DESC
      LIMIT 1
    `;

    if (!latestCupon || latestCupon.length === 0) {
      return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 });
    }

    const cupon = latestCupon[0];

    // Validar que el cupón no fue eliminado
    if (cupon.change_type === 'DELETE') {
      return NextResponse.json({ error: 'Este cupón ya no está disponible' }, { status: 400 });
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
          porcentaje_descuento: parseFloat(cupon.porcentaje_descuento),
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
