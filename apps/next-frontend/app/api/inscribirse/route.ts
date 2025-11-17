import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';
import { Resend } from 'resend';
import { generateQRCode, getQRCodeURL } from '@/lib/qr-utils';

const resend = new Resend(process.env.RESEND_API_KEY);

// Endpoint para inscribirse a un evento gratis
export async function POST(request: NextRequest) {
  try {
    const { eventId, nombre, correo, userId } = await request.json();

    // Validaciones
    if (!eventId) {
      return NextResponse.json({ message: 'eventId es requerido' }, { status: 400 });
    }

    // Si tiene userId (usuario autenticado), obtener datos de la sesión
    if (userId && (!nombre || !correo)) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
      }

      return await createSignup({
        eventId,
        nombre: user.name || user.email || 'Usuario',
        correo: user.email,
        userId,
      });
    }

    // Validar que tenemos nombre y correo
    if (!nombre || !correo) {
      return NextResponse.json({ message: 'nombre y correo son requeridos' }, { status: 400 });
    }

    return await createSignup({
      eventId,
      nombre,
      correo,
      userId: userId || null,
    });
  } catch (error) {
    console.error('Error en inscripción:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}

async function createSignup({
  eventId,
  nombre,
  correo,
  userId,
}: {
  eventId: string;
  nombre: string;
  correo: string;
  userId: string | null;
}) {
  try {
    // Verificar que el evento existe y es gratis
    const evento = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      include: {
        stock_entrada: true,
      },
    });

    if (!evento) {
      return NextResponse.json({ message: 'Evento no encontrado' }, { status: 404 });
    }

    // Verificar que todos los tipos de entrada tienen precio 0 (evento gratis)
    const isFree = evento.stock_entrada?.every((stock: any) => Number(stock.precio) === 0);

    if (!isFree) {
      return NextResponse.json({ message: 'Este evento no es gratuito' }, { status: 400 });
    }

    // Verificar si ya existe una inscripción para este correo y evento
    const existingInscripcion = await prisma.inscripciones_evento.findFirst({
      where: {
        eventoid: eventId,
        correo: correo.toLowerCase(),
      },
    });

    if (existingInscripcion) {
      return NextResponse.json(
        { message: 'Ya estás registrado para este evento' },
        { status: 409 },
      );
    }

    // Crear la inscripción
    const inscripcion = await prisma.inscripciones_evento.create({
      data: {
        eventoid: eventId,
        nombre,
        correo: correo.toLowerCase(),
        usuarioid: userId,
        fecha_inscripcion: new Date(),
        estado: 'confirmado',
      },
    });

    // Generar código QR simple (mismo formato que los QRs de cortesía)
    const codigoQR = generateQRCode();

    // Crear registro de código QR
    let codigoRegistro;
    try {
      codigoRegistro = await prisma.codigos_qr.create({
        data: {
          inscripcionid: inscripcion.inscripcionid,
          eventoid: eventId,
          codigo: codigoQR,
          datos_qr: codigoQR,
        },
      });
    } catch (qrError) {
      console.error('Error creando código QR:', qrError);
      // Si falla la creación del QR, aún así devolvemos la inscripción pero con error
      return NextResponse.json(
        {
          message: 'Inscripción creada pero hubo error al generar el código QR',
          data: {
            inscripcion,
            error: 'QR generation failed',
          },
        },
        { status: 201 },
      );
    }

    // Generar URL del QR (contenido simple)
    const qrImageUrl = getQRCodeURL(codigoQR);

    // Enviar email con QR
    try {
      await resend.emails.send({
        from: 'Ticketeate <onboarding@ticketeate.com.ar>',
        to: [correo],
        subject: `Tu código QR para el evento: ${evento.titulo}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>¡Inscripción confirmada!</h2>
            <p>Hola <strong>${nombre}</strong>,</p>
            <p>Tu inscripción al evento <strong>${evento.titulo}</strong> ha sido confirmada exitosamente.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin-top: 0; color: #666;">Tu código QR de acceso:</p>
              <img src="${qrImageUrl}" alt="Código QR" style="width: 300px; height: 300px; margin: 20px 0;" />
              <p style="color: #333; font-weight: bold; font-size: 18px;">Código: ${codigoQR}</p>
            </div>
            
            <p>Por favor <strong>guarda este código QR</strong> y llévalo contigo el día del evento. Lo necesitarás para validar tu entrada.</p>
            
            <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0084ff;">
              <strong>Importante:</strong>
              <ul>
                <li>Presente este código QR al momento de ingresar al evento</li>
                <li>Si no ves el QR en este email, puedes capturar el código mostrado arriba</li>
                <li>Asegúrate de tener buena luz y enfoque para escanear correctamente</li>
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">
              Si tienes preguntas, contacta al organizador del evento.<br>
              Ticketeate - Plataforma de eventos
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // No lanzamos error aquí, la inscripción ya se creó exitosamente
    }

    return NextResponse.json(
      {
        message: 'Inscripción exitosa',
        data: {
          inscripcion,
          codigoQR: codigoRegistro,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error en createSignup:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
