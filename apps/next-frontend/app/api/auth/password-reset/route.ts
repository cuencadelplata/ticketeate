import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'forgot':
        const forgotData = forgotPasswordSchema.parse(data);
        const forgotResult = await auth.api.forgotPassword({
          body: { email: forgotData.email },
        });

        if (forgotResult.error) {
          return NextResponse.json({ error: forgotResult.error.message }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico',
        });

      case 'reset':
        const resetData = resetPasswordSchema.parse(data);
        const resetResult = await auth.api.resetPassword({
          body: {
            token: resetData.token,
            password: resetData.password,
          },
        });

        if (resetResult.error) {
          return NextResponse.json({ error: resetResult.error.message }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          message: 'Contraseña restablecida correctamente',
        });

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error handling password reset:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
