import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export async function POST(request: NextRequest) {
  try {
    // Obtener la sesión actual del usuario
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Limpiar la información de Mercado Pago del usuario
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        mercadoPagoUserId: null,
        mercadoPagoAccessToken: null,
        mercadoPagoRefreshToken: null,
        mercadoPagoTokenExpiresAt: null,
        mercadoPagoUserInfo: null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error al desconectar Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
