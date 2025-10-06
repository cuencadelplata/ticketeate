import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export async function GET(request: NextRequest) {
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

    // Verificar si el usuario tiene Mercado Pago conectado
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        mercadoPagoUserId: true,
        mercadoPagoAccessToken: true,
        mercadoPagoTokenExpiresAt: true,
        mercadoPagoUserInfo: true,
      },
    });

    const isConnected = !!(
      user?.mercadoPagoUserId && 
      user?.mercadoPagoAccessToken &&
      user?.mercadoPagoTokenExpiresAt &&
      new Date(user.mercadoPagoTokenExpiresAt) > new Date()
    );

    let userInfo = null;
    if (user?.mercadoPagoUserInfo) {
      try {
        userInfo = JSON.parse(user.mercadoPagoUserInfo);
      } catch (error) {
        console.error('Error al parsear información de Mercado Pago:', error);
      }
    }

    return NextResponse.json({
      connected: isConnected,
      userInfo: userInfo,
      expiresAt: user?.mercadoPagoTokenExpiresAt,
    });

  } catch (error) {
    console.error('Error al verificar estado de Mercado Pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
