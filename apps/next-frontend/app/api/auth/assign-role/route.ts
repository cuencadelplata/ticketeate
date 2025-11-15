import { NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import * as jwt from 'jsonwebtoken';

// En el servidor, usar API_EVENTS_URL (variable privada)
// En desarrollo: http://localhost:3001/api
// En producción: usar la URL privada de la API
const API_EVENTS =
  process.env.API_EVENTS_URL ||
  process.env.NEXT_PUBLIC_API_EVENTS_URL ||
  'http://localhost:3001/api';

export async function POST(req: Request) {
  try {
    const { role, inviteCode } = (await req.json()) as {
      role: 'USUARIO' | 'ORGANIZADOR' | 'COLABORADOR';
      inviteCode?: string;
    };

    console.log('[assign-role] Recibido:', { role, inviteCode });

    if (!role || !['USUARIO', 'ORGANIZADOR', 'COLABORADOR'].includes(role)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const session = await auth.api.getSession({ headers: req.headers });
    console.log('[assign-role] Session:', {
      userId: session?.user?.id,
      email: session?.user?.email,
    });

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // COLABORADOR requiere código de invitación
    if (role === 'COLABORADOR') {
      if (!inviteCode) {
        return NextResponse.json(
          { error: 'Código de invitación requerido para COLABORADOR' },
          { status: 400 },
        );
      }

      // Validar el código en el microservicio de eventos
      try {
        console.log('[assign-role] Validando código:', { inviteCode, apiUrl: API_EVENTS });

        const validateResponse = await fetch(`${API_EVENTS}/invite-codes/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo: inviteCode }),
        });

        console.log('[assign-role] Validación response status:', validateResponse.status);

        if (!validateResponse.ok) {
          const error = await validateResponse.json();
          console.error('[assign-role] Validación falló:', error);
          return NextResponse.json(
            { error: error.error || 'Código de invitación inválido' },
            { status: 401 },
          );
        }

        console.log('[assign-role] Código validado correctamente');

        // Usar el código de invitación (vincular colaborador al evento)
        // Primero obtener un token JWT válido
        let authToken = '';
        try {
          // Generar token JWT para autenticarse con el microservicio
          authToken = jwt.sign(
            {
              id: session.user.id,
              email: session.user.email,
              role: session.user.role || 'USUARIO',
            },
            process.env.BETTER_AUTH_SECRET!,
            {
              issuer: process.env.FRONTEND_URL || 'http://localhost:3000',
              audience: process.env.FRONTEND_URL || 'http://localhost:3000',
              expiresIn: '1h',
              algorithm: 'HS256',
            },
          );
        } catch (tokenError) {
          console.error('Error generating token:', tokenError);
          return NextResponse.json(
            { error: 'Error al generar token de autenticación' },
            { status: 500 },
          );
        }

        const useResponse = await fetch(`${API_EVENTS}/invite-codes/use`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ codigo: inviteCode }),
        });

        console.log('[assign-role] Use invite-code response status:', useResponse.status);

        if (!useResponse.ok) {
          const error = await useResponse.json();
          console.error('[assign-role] Use invite-code falló:', error);
          return NextResponse.json(
            { error: error.error || 'Error al usar código de invitación' },
            { status: 400 },
          );
        }

        console.log('[assign-role] Código de invitación usado correctamente');
      } catch (error) {
        console.error('Error validating invite code:', error);
        return NextResponse.json(
          { error: 'Error al validar código de invitación' },
          { status: 500 },
        );
      }
    }

    // Actualizar el rol del usuario
    console.log('[assign-role] Actualizando rol del usuario:', {
      userId: session.user.id,
      newRole: role,
    });

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: role as any,
      },
    });

    console.log('[assign-role] Rol actualizado exitosamente:', {
      userId: updatedUser.id,
      role: updatedUser.role,
    });

    // Devolver la sesión actualizada para que el cliente la use
    return NextResponse.json({
      ok: true,
      role: updatedUser.role,
      user: updatedUser,
    });
  } catch (e) {
    console.error('[assign-role] Error general:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
