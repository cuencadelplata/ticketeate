import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export async function GET(request: NextRequest) {
  try {
    // Obtener la sesión del usuario
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Obtener reservas del usuario con información del evento
    const reservas = await prisma.reservas.findMany({
      where: {
        usuarioid: userId,
        is_active: true,
        deleted_at: null,
      },
      include: {
        eventos: {
          include: {
            imagenes_evento: {
              where: {
                tipo: 'PORTADA',
              },
              take: 1,
            },
            fechas_evento: {
              orderBy: {
                fecha_hora: 'asc',
              },
              take: 1,
            },
            evento_categorias: {
              include: {
                categoriaevento: true,
              },
            },
          },
        },
        stock_entrada: true,
        fechas_evento: true,
        entradas: {
          where: {
            is_active: true,
            deleted_at: null,
          },
        },
        pagos: {
          orderBy: {
            fecha_pago: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        fecha_reserva: 'desc',
      },
    });

    // Formatear las reservas para el frontend
    const reservasFormateadas = reservas.map((reserva) => {
      const evento = reserva.eventos;
      const imagenPortada = evento.imagenes_evento?.[0]?.url || null;
      const fechaEvento = evento.fechas_evento?.[0] || reserva.fechas_evento;
      const categoria = evento.evento_categorias?.[0]?.categoriaevento?.nombre || null;
      const pago = reserva.pagos?.[0];

      return {
        reservaid: reserva.reservaid,
        eventoid: reserva.eventoid,
        cantidad: reserva.cantidad,
        estado: reserva.estado,
        fecha_reserva: reserva.fecha_reserva,
        evento: {
          eventoid: evento.eventoid,
          titulo: evento.titulo,
          descripcion: evento.descripcion,
          ubicacion: evento.ubicacion,
          imagen: imagenPortada,
          fecha: fechaEvento?.fecha_hora || null,
          categoria: categoria,
        },
        entrada: {
          nombre: reserva.stock_entrada.nombre,
          precio: reserva.stock_entrada.precio.toString(),
          moneda: reserva.stock_entrada.moneda,
        },
        entradas: reserva.entradas.map((entrada) => ({
          entradaid: entrada.entradaid,
          codigo_qr: entrada.codigo_qr,
          estado: entrada.estado,
        })),
        pago: pago
          ? {
              pagoid: pago.pagoid,
              estado: pago.estado,
              monto_total: pago.monto_total.toString(),
              moneda: pago.moneda,
              fecha_pago: pago.fecha_pago,
            }
          : null,
      };
    });

    return NextResponse.json({
      reservas: reservasFormateadas,
      total: reservasFormateadas.length,
    });
  } catch (error) {
    console.error('Error obteniendo reservas del usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
