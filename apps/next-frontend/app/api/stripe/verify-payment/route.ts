import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const usuarioid = searchParams.get('usuario_id');
    
    if (!sessionId || !usuarioid) {
      return NextResponse.json(
        { error: 'Faltan parámetros: session_id y usuario_id requeridos' },
        { status: 400 }
      );
    }

    // Buscar pagos de Stripe para este usuario
    const pagos = await prisma.pagos.findMany({
      where: {
        metodo_pago: 'stripe',
        reservas: {
          usuarioid: String(usuarioid),
        },
      },
      include: {
        reservas: {
          include: {
            eventos: {
              include: {
                fechas_evento: true,
                imagenes_evento: true,
              },
            },
            entradas: true,
            stock_entrada: true,
          },
        },
      },
      orderBy: {
        fecha_pago: 'desc',
      },
      take: 1, // Solo el más reciente
    });

    if (pagos.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron pagos recientes para este usuario' },
        { status: 404 }
      );
    }

    const pago = pagos[0];
    const reserva = pago.reservas;

    // Formatear respuesta similar a /api/comprar
    const resultado = {
      reserva: {
        id_reserva: reserva.reservaid,
        id_usuario: reserva.usuarioid,
        id_evento: reserva.eventoid,
        cantidad: reserva.cantidad,
        estado: reserva.estado,
        fecha_reserva: reserva.fecha_reserva,
      },
      pago: {
        id_pago: pago.pagoid,
        id_reserva: pago.reservaid,
        metodo_pago: pago.metodo_pago,
        monto_total: Number(pago.monto_total),
        estado: pago.estado,
        fecha_pago: pago.fecha_pago,
      },
      entradas: reserva.entradas.map((entrada: any) => ({
        id_entrada: entrada.entradaid,
        id_reserva: entrada.reservaid,
        codigo_qr: entrada.codigo_qr,
        estado: entrada.estado,
      })),
      evento: {
        titulo: reserva.eventos.titulo,
        descripcion: reserva.eventos.descripcion,
        imagen_url: reserva.eventos.imagenes_evento?.[0]?.url || '/icon-ticketeate.png',
        fecha_hora: reserva.eventos.fechas_evento?.[0]?.fecha_hora,
        ubicacion: reserva.eventos.ubicacion,
      },
      resumen: {
        total_entradas: reserva.cantidad,
        precio_unitario: Number(reserva.stock_entrada.precio).toFixed(2),
        monto_total: Number(pago.monto_total).toFixed(2),
        metodo_pago: pago.metodo_pago,
        estado: 'Compra procesada exitosamente con Stripe',
      },
    };

    return NextResponse.json(resultado);

  } catch (error) {
    console.error('Error recuperando información de pago Stripe:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
