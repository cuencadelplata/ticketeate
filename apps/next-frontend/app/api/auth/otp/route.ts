import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
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

        // Usar el endpoint estándar de Better Auth para enviar OTP
        const sendResponse = await fetch(
          `${process.env.BETTER_AUTH_URL}/api/auth/sign-in/email-otp`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: sendData.email,
            }),
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

        return NextResponse.json({
          success: true,
          message: 'Código OTP enviado al correo electrónico',
        });

      case 'verify':
        const verifyData = verifyOtpSchema.parse(data);

        // Usar el endpoint estándar de Better Auth para verificar OTP
        const verifyResponse = await fetch(
          `${process.env.BETTER_AUTH_URL}/api/auth/verify-email-otp`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: verifyData.email,
              otp: verifyData.otp,
            }),
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

        return NextResponse.json({
          success: true,
          message: 'Código OTP verificado correctamente',
          session: verifyResult.session,
          user: verifyResult.user,
        });

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
