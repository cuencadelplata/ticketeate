import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Body esperado:
// {
//   id_usuario: number,
//   id_evento: number,
//   cantidad: number,
//   metodo_pago: string
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_usuario, id_evento, cantidad, metodo_pago } = body ?? {};

    if (!id_usuario || !id_evento || !cantidad || !metodo_pago) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Transacción: crear reserva, pago y entradas
    const result = await prisma.$transaction(async (tx: any) => {
      const reserva = await tx.reserva.create({
        data: {
          id_usuario,
          id_evento,
          cantidad,
          estado: 'PENDIENTE',
        },
      });

      const pago = await tx.pago.create({
        data: {
          reservaId: reserva.id,
          metodo_pago,
          monto_total: String(cantidad),
          estado: 'APROBADO',
        },
      });

      const entradas = await Promise.all(
        Array.from({ length: cantidad }).map((_, idx) =>
          tx.entrada.create({
            data: {
              reservaId: reserva.id,
              codigo_qr: `${reserva.id}-${Date.now()}-${idx}`,
              estado: 'ACTIVA',
            },
          })
        )
      );

      return { reserva, pago, entradas };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error en /api/comprar', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
