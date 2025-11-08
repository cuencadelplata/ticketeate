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
        const sendResult = await auth.api.sendOtp({
          body: { email: sendData.email },
        });

        if (sendResult.error) {
          return NextResponse.json({ error: sendResult.error.message }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          message: 'Código OTP enviado al correo electrónico',
        });

      case 'verify':
        const verifyData = verifyOtpSchema.parse(data);
        const verifyResult = await auth.api.verifyOtp({
          body: {
            email: verifyData.email,
            otp: verifyData.otp,
          },
        });

        if (verifyResult.error) {
          return NextResponse.json({ error: verifyResult.error.message }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          message: 'Código OTP verificado correctamente',
        });

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error handling OTP:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
