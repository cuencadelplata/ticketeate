import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Verificar si hay error en la respuesta
    if (error) {
      console.error('Error en OAuth de Mercado Pago:', error);
      return NextResponse.redirect(
        new URL('/profile?error=oauth_error', request.url)
      );
    }

    // Verificar que tenemos el código de autorización
    if (!code) {
      return NextResponse.redirect(
        new URL('/profile?error=no_code', request.url)
      );
    }

    // Verificar state para seguridad CSRF
    const storedState = request.cookies.get('mp_oauth_state')?.value;
    if (!state || state !== storedState) {
      console.error('Estado CSRF inválido:', { state, storedState });
      return NextResponse.redirect(
        new URL('/profile?error=invalid_state', request.url)
      );
    }

    // Intercambiar código por access token
    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.MERCADOPAGO_CLIENT_ID!,
        client_secret: process.env.MERCADOPAGO_CLIENT_SECRET!,
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/mercadopago/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Error al obtener token:', errorData);
      return NextResponse.redirect(
        new URL('/profile?error=token_error', request.url)
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in, user_id } = tokenData;

    // Obtener información del usuario de Mercado Pago
    const userInfoResponse = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json',
      },
    });

    let mpUserInfo = null;
    if (userInfoResponse.ok) {
      mpUserInfo = await userInfoResponse.json();
    }

    // Obtener la sesión actual del usuario
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.redirect(
        new URL('/sign-in?redirect_url=/profile', request.url)
      );
    }

    // Guardar la información de Mercado Pago en la base de datos
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        mercadoPagoUserId: user_id,
        mercadoPagoAccessToken: access_token,
        mercadoPagoRefreshToken: refresh_token,
        mercadoPagoTokenExpiresAt: new Date(Date.now() + expires_in * 1000),
        mercadoPagoUserInfo: mpUserInfo ? JSON.stringify(mpUserInfo) : null,
        updatedAt: new Date(),
      },
    });

    // Limpiar el state cookie
    const response = NextResponse.redirect(
      new URL('/profile?success=connected', request.url)
    );
    
    response.cookies.delete('mp_oauth_state');
    
    return response;

  } catch (error) {
    console.error('Error en callback de Mercado Pago:', error);
    return NextResponse.redirect(
      new URL('/profile?error=server_error', request.url)
    );
  }
}
