import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';

/**
 * PUT /api/user/profile
 * Actualiza el perfil del usuario autenticado
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    if (name.trim().length > 255) {
      return NextResponse.json(
        { error: 'El nombre no puede exceder 255 caracteres' },
        { status: 400 },
      );
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Perfil actualizado correctamente',
    });
  } catch (error) {
    console.error('[USER PROFILE] Error:', error);
    return NextResponse.json({ error: 'Error al actualizar el perfil' }, { status: 500 });
  }
}

/**
 * GET /api/user/profile
 * Obtiene el perfil del usuario autenticado
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[USER PROFILE] Error:', error);
    return NextResponse.json({ error: 'Error al obtener el perfil' }, { status: 500 });
  }
}
