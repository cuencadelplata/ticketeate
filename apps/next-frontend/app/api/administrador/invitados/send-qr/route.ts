import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST: Enviar QR por email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, invitadoId } = body;

    if (!eventId || !invitadoId) {
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
      select: { creadorid: true, titulo: true },
    });

    if (!evento) {
      return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 });
    }

    if (evento.creadorid !== session.user.id) {
      return NextResponse.json({ message: 'No tienes permiso para enviar QRs' }, { status: 403 });
    }

    // Obtener invitado y su QR
    const invitado = await prisma.inscripciones_evento.findUnique({
      where: { inscripcionid: invitadoId },
      include: {
        codigos_qr: {
          select: {
            codigo: true,
          },
        },
      },
    });

    if (!invitado) {
      return NextResponse.json({ message: 'Invitado no encontrado' }, { status: 404 });
    }

    if (!invitado.codigos_qr || invitado.codigos_qr.length === 0) {
      return NextResponse.json({ message: 'QR no encontrado' }, { status: 404 });
    }

    const codigo = invitado.codigos_qr[0].codigo;

    // Generar imagen del QR
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(codigo)}`;

    // Enviar email con el QR
    const result = await resend.emails.send({
      from: 'Ticketeate <onboarding@ticketeate.com.ar>',
      to: [invitado.correo],
      subject: `QR de Cortesía - ${evento.titulo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Hola ${invitado.nombre || 'Invitado'},</h1>
          
          <p style="color: #666; font-size: 16px;">
            Aquí está tu QR de cortesía para el evento <strong>${evento.titulo}</strong>
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="${qrImageUrl}" alt="QR Code" style="max-width: 300px; height: auto;" />
          </div>
          
          <p style="color: #666; font-size: 14px; word-break: break-all;">
            Código de referencia: <strong>${codigo}</strong>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Presentá este QR en la entrada del evento. Si tienes problemas, comunícate con los organizadores.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Ticketeate - Plataforma de Gestión de Eventos
          </p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Error enviando email:', result.error);
      return NextResponse.json(
        { message: 'Error al enviar el email', error: result.error },
        { status: 500 },
      );
    }

    // Actualizar estado a 'enviado'
    await prisma.inscripciones_evento.update({
      where: { inscripcionid: invitadoId },
      data: { estado: 'enviado' },
    });

    return NextResponse.json({
      data: {
        success: true,
        message: 'QR enviado correctamente',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al enviar QR' }, { status: 500 });
  }
}
