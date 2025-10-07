import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioid = searchParams.get('usuario_id');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!usuarioid) {
      return NextResponse.json(
        { error: 'usuario_id es requerido' },
        { status: 400 }
      );
    }

    // Consultar historial de compras del usuario
    const historialCompras = await prisma.$queryRaw`
      SELECT 
        hc.*,
        e.titulo as evento_titulo,
        e.ubicacion as evento_ubicacion,
        r.cantidad as reserva_cantidad,
        r.estado as reserva_estado
      FROM historial_compras hc
      LEFT JOIN eventos e ON hc.eventoid = e.eventoid
      LEFT JOIN reservas r ON hc.reservaid = r.reservaid
      WHERE hc.usuarioid = ${usuarioid}
      ORDER BY hc.fecha_compra DESC
      LIMIT ${limit}
    `;

    return NextResponse.json({ 
      compras: historialCompras,
      total: Array.isArray(historialCompras) ? historialCompras.length : 0
    });

  } catch (error) {
    console.error('Error consultando historial de compras:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
