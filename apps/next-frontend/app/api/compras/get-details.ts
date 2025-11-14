import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const purchase = await prisma.historial_compras.findUnique({
      where: { id },
      include: {
        eventos: {
          select: {
            eventoid: true,
            titulo: true,
            ubicacion: true,
            descripcion: true,
            imagenes_evento: {
              select: { url: true },
              take: 5,
            },
          },
        },
        reservas: {
          select: {
            cantidad: true,
            estado: true,
            fechas_evento: {
              select: { fecha_hora: true },
            },
            entradas: {
              select: {
                entradaid: true,
                codigo_qr: true,
                estado: true,
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      return NextResponse.json(
        { success: false, message: 'Compra no encontrada' },
        { status: 404 },
      );
    }

    const eventDate = purchase.reservas.fechas_evento.fecha_hora;

    return NextResponse.json({
      success: true,
      purchase: {
        id: purchase.id,
        eventId: purchase.eventoid,
        eventName: purchase.eventos.titulo,
        eventImage: purchase.eventos.imagenes_evento[0]?.url,
        gallery: purchase.eventos.imagenes_evento.map((img) => img.url),
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toISOString().split('T')[1]?.split('.')[0],
        venue: purchase.eventos.ubicacion,
        description: purchase.eventos.descripcion,
        ticketCount: purchase.cantidad,
        ticketType: 'General',
        totalPrice: Number(purchase.monto_total),
        currency: purchase.moneda,
        status: purchase.estado_compra,
        purchaseDate: purchase.fecha_compra.toISOString(),
        orderId: `ORD-${purchase.id.substring(0, 8).toUpperCase()}`,
        tickets: purchase.reservas.entradas.map((t) => ({
          id: t.entradaid,
          qrCode: t.codigo_qr,
          validated: t.estado === 'USADA',
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching purchase:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener compra' },
      { status: 500 },
    );
  }
}
