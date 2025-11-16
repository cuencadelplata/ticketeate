import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { webcrypto as crypto } from 'crypto';

// GET: Obtener lista de invitados de un evento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json({ message: 'eventId es requerido' }, { status: 400 });
    }

    // Obtener la sesión del usuario
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    // Verificar que el usuario es el organizador del evento
    const evento = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { creadorid: true },
    });

    if (!evento) {
      return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 });
    }

    if (evento.creadorid !== session.user.id) {
      return NextResponse.json(
        { message: 'No tienes permiso para ver los invitados' },
        { status: 403 },
      );
    }

    // Obtener invitados (inscripciones con usuarioid null = QRs de cortesía)
    const invitados = await prisma.inscripciones_evento.findMany({
      where: {
        eventoid: eventId,
        usuarioid: null, // Solo invitados sin usuario asociado
      },
      include: {
        codigos_qr: {
          select: {
            codigoqrid: true,
            codigo: true,
            validado: true,
            fecha_creacion: true,
          },
        },
      },
      orderBy: { fecha_inscripcion: 'desc' },
    });

    return NextResponse.json({
      data: {
        invitados: invitados.map((inv: any) => ({
          id: inv.inscripcionid,
          nombre: inv.nombre,
          email: inv.correo,
          estado: inv.estado,
          fechaEnvio: inv.fecha_inscripcion,
          qr: invitados.length > 0 && inv.codigos_qr.length > 0 ? inv.codigos_qr[0].codigo : null,
        })),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al obtener invitados' }, { status: 500 });
  }
}

// POST: Crear un nuevo invitado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, nombre, email } = body;

    if (!eventId || !nombre || !email) {
      return NextResponse.json({ message: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Obtener la sesión del usuario
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autenticado' }, { status: 401 });
    }

    // Verificar que el usuario es el organizador del evento
    const evento = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      select: { creadorid: true },
    });

    if (!evento) {
      return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 });
    }

    if (evento.creadorid !== session.user.id) {
      return NextResponse.json(
        { message: 'No tienes permiso para crear invitados' },
        { status: 403 },
      );
    }

    // Generar código QR aleatorio (32 caracteres hexadecimales)
    const codigo = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Crear inscripción de invitado (sin usuarioid)
    const invitado = await prisma.inscripciones_evento.create({
      data: {
        eventoid: eventId,
        nombre,
        correo: email,
        estado: 'pendiente',
      },
    });

    // Crear código QR
    await prisma.codigos_qr.create({
      data: {
        inscripcionid: invitado.inscripcionid,
        eventoid: eventId,
        codigo,
        datos_qr: JSON.stringify({
          tipo: 'cortesia',
          eventoid: eventId,
          invitadoid: invitado.inscripcionid,
          nombre,
          email,
        }),
      },
    });

    return NextResponse.json({
      data: {
        id: invitado.inscripcionid,
        nombre,
        email,
        codigo,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al crear invitado' }, { status: 500 });
  }
}
