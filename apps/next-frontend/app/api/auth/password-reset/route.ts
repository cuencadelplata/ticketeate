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
        const forgotResult = await auth.api.forgetPassword({
          body: { email: forgotData.email },
        });

        if (!forgotResult.status) {
          return NextResponse.json(
            { error: 'Error al enviar el enlace de restablecimiento' },
            { status: 400 },
          );
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
            newPassword: resetData.password,
          },
        });

        if (!resetResult.status) {
          return NextResponse.json(
            { error: 'Error al restablecer la contraseña' },
            { status: 400 },
          );
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
