import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { API_ENDPOINTS } from '@/lib/config';

// Helper para obtener token JWT
async function getAuthToken() {
  try {
    const res = await fetch(
      `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/api/auth/token`,
      {
        credentials: 'include',
        headers: {
          Cookie: (await headers()).get('cookie') || '',
        },
      },
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data.token;
  } catch {
    return null;
  }
}

// Validar que el usuario sea dueño del evento
async function validateEventOwnership(eventId: string, userId: string): Promise<boolean> {
  try {
    const token = await getAuthToken();
    if (!token) return false;

    const res = await fetch(`${API_ENDPOINTS.events}/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return false;

    const data = await res.json();
    const event = data.event;

    // Verificar que el usuario sea el dueño del evento
    return event?.userid === userId || event?.productor_id === userId;
  } catch (error) {
    console.error('Error validating event ownership:', error);
    return false;
  }
}

// Route Handler para revalidar una página específica
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, secret } = body;

    if (!eventId) {
      return NextResponse.json({ message: 'Event ID is required' }, { status: 400 });
    }

    // Método 1: Secret desde webhook externo (bypass de validación de propiedad)
    if (secret) {
      if (secret !== process.env.REVALIDATION_SECRET) {
        return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
      }
    } else {
      // Método 2: Validar sesión de usuario autenticado
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        return NextResponse.json(
          { message: 'Unauthorized - Authentication required' },
          { status: 401 },
        );
      }

      // Validar que el usuario sea el dueño del evento
      const isOwner = await validateEventOwnership(eventId, session.user.id);

      if (!isOwner) {
        return NextResponse.json(
          { message: 'Forbidden - You do not own this event' },
          { status: 403 },
        );
      }
    }

    // Revalidar la página específica del evento
    revalidatePath(`/evento/${eventId}`);

    // También revalidar la lista de eventos
    revalidatePath('/eventos');

    return NextResponse.json({
      revalidated: true,
      message: `Event ${eventId} revalidated successfully`,
      now: Date.now(),
    });
  } catch (err) {
    console.error('Error revalidating:', err);
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 },
    );
  }
}

// También puedes revalidar múltiples eventos a la vez
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventIds, secret } = body;

    if (!eventIds || !Array.isArray(eventIds)) {
      return NextResponse.json({ message: 'Event IDs array is required' }, { status: 400 });
    }

    // Método 1: Secret desde webhook externo (bypass de validación)
    if (secret) {
      if (secret !== process.env.REVALIDATION_SECRET) {
        return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
      }
    } else {
      // Método 2: Validar sesión de usuario autenticado
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        return NextResponse.json(
          { message: 'Unauthorized - Authentication required' },
          { status: 401 },
        );
      }

      // Validar que el usuario sea dueño de TODOS los eventos
      const ownershipChecks = await Promise.all(
        eventIds.map((eventId) => validateEventOwnership(eventId, session.user.id)),
      );

      const allOwned = ownershipChecks.every((isOwner) => isOwner);

      if (!allOwned) {
        return NextResponse.json(
          { message: 'Forbidden - You do not own all specified events' },
          { status: 403 },
        );
      }
    }

    // Revalidar todas las páginas
    eventIds.forEach((eventId) => {
      revalidatePath(`/evento/${eventId}`);
    });

    revalidatePath('/eventos');

    return NextResponse.json({
      revalidated: true,
      message: `${eventIds.length} events revalidated successfully`,
      eventIds,
      now: Date.now(),
    });
  } catch (err) {
    console.error('Error revalidating:', err);
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 },
    );
  }
}
