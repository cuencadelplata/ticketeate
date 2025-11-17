import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

interface ScanTicketRequest {
  eventoid: string;
  codigo_qr: string;
}

interface ScanResult {
  success: boolean;
  entradaid: string;
  codigo_qr: string;
  estado: string;
  message: string;
}

/**
 * POST /api/scanner/scan
 * Escanea un ticket QR y actualiza su estado
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as ScanTicketRequest;
    const { eventoid, codigo_qr } = body;

    if (!eventoid || !codigo_qr) {
      return NextResponse.json({ error: 'eventoid y codigo_qr son requeridos' }, { status: 400 });
    }

    // Buscar la entrada por código QR
    const entrada = await prisma.entradas.findFirst({
      where: {
        codigo_qr: codigo_qr.trim(),
      },
      include: {
        reservas: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!entrada) {
      return NextResponse.json({ error: 'Código QR no encontrado' }, { status: 404 });
    }

    // Verificar que pertenece al evento correcto
    if (entrada.reservas.eventoid !== eventoid) {
      return NextResponse.json(
        { error: 'Este código QR no corresponde al evento' },
        { status: 400 },
      );
    }

    // Verificar si ya fue escaneada
    if (entrada.estado === 'USADA') {
      return NextResponse.json(
        {
          error: 'Esta entrada ya fue escaneada',
          data: {
            success: false,
            entradaid: entrada.entradaid,
            codigo_qr: entrada.codigo_qr || '',
            estado: entrada.estado,
            message: 'Esta entrada ya fue escaneada',
          },
        },
        { status: 400 },
      );
    }

    // Actualizar el estado de la entrada a USADA
    const entradaActualizada = await prisma.entradas.update({
      where: { entradaid: entrada.entradaid },
      data: {
        estado: 'USADA',
      },
      include: {
        reservas: {
          include: {
            user: true,
          },
        },
      },
    });

    const result: ScanResult = {
      success: true,
      entradaid: entradaActualizada.entradaid,
      codigo_qr: entradaActualizada.codigo_qr || '',
      estado: entradaActualizada.estado,
      message: `Ticket escaneado correctamente - ${entradaActualizada.reservas.user.name || 'Usuario'}`,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[SCANNER] Error escaneando ticket:', error);
    return NextResponse.json({ error: 'Error al escanear el ticket' }, { status: 500 });
  }
}
