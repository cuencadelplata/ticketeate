import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';

const sendOtpSchema = z.object({
  email: z.string().email('Email inválido'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Email inválido'),
  otp: z.string().length(6, 'El código OTP debe tener 6 dígitos'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'send':
        const sendData = sendOtpSchema.parse(data);

        // Obtener cookies del cliente para mantener la sesión OTP
        const cookieHeaderSend = request.headers.get('cookie') || '';

        // Usar el endpoint estándar de Better Auth para enviar OTP
        const sendResponse = await fetch(
          `${process.env.BETTER_AUTH_URL}/api/auth/sign-in/email-otp`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(cookieHeaderSend ? { Cookie: cookieHeaderSend } : {}),
            },
            body: JSON.stringify({
              email: sendData.email,
            }),
            credentials: 'include',
          },
        );

        const sendResult = await sendResponse.json();

        if (!sendResponse.ok || sendResult.error) {
          return NextResponse.json(
            {
              error: sendResult.error?.message || 'Error al enviar el código OTP',
            },
            { status: 400 },
          );
        }

        const response = NextResponse.json({
          success: true,
          message: 'Código OTP enviado al correo electrónico',
        });

        // Propagar las cookies de Better Auth al cliente
        const setCookieHeaders = sendResponse.headers.getSetCookie();
        setCookieHeaders.forEach((cookie) => {
          response.headers.append('Set-Cookie', cookie);
        });

        return response;

      case 'verify':
        const verifyData = verifyOtpSchema.parse(data);

        // Usar el endpoint estándar de Better Auth para verificar OTP
        // Obtener cookies del cliente para mantener la sesión OTP
        const cookieHeader = request.headers.get('cookie') || '';

        const verifyResponse = await fetch(
          `${process.env.BETTER_AUTH_URL}/api/auth/verify-email-otp`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(cookieHeader ? { Cookie: cookieHeader } : {}),
            },
            body: JSON.stringify({
              email: verifyData.email,
              otp: verifyData.otp,
            }),
            credentials: 'include',
          },
        );

        const verifyResult = await verifyResponse.json();

        if (!verifyResponse.ok || verifyResult.error) {
          return NextResponse.json(
            {
              error: verifyResult.error?.message || 'Código OTP inválido',
            },
            { status: 400 },
          );
        }

        const verifyResponseData = NextResponse.json({
          success: true,
          message: 'Código OTP verificado correctamente',
          session: verifyResult.session,
          user: verifyResult.user,
        });

        // Propagar las cookies de Better Auth al cliente
        const verifySetCookieHeaders = verifyResponse.headers.getSetCookie();
        verifySetCookieHeaders.forEach((cookie) => {
          verifyResponseData.headers.append('Set-Cookie', cookie);
        });

        return verifyResponseData;

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    console.error('OTP API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 },
    );
  }
}
