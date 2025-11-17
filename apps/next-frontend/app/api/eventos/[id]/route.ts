import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@repo/db';
import { randomUUID } from 'crypto';

function generateId() {
  try {
    return randomUUID();
  } catch (e) {
    // Fallback para entornos donde crypto no está disponible
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * GET /api/eventos/[id]
 * Obtiene información detallada de un evento específico (admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: eventId } = await params;

    // Obtener información completa del evento
    const evento = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      include: {
        stock_entrada: true,
        fechas_evento: true,
        imagenes_evento: true,
        evento_estado: {
          orderBy: { fecha_de_cambio: 'desc' },
          take: 1,
        },
        evento_modificaciones: {
          orderBy: { fecha_modificacion: 'desc' },
          take: 10,
        },
        evento_categorias: {
          include: {
            categoriaevento: true,
          },
        },
        user: {
          select: { id: true, email: true },
        },
      },
    });

    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario sea el creador del evento
    if (evento.creadorid !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para acceder a este evento' },
        { status: 403 },
      );
    }

    return NextResponse.json({ event: evento }, { status: 200 });
  } catch (error) {
    console.error('[EVENTOS GET] Error obteniendo evento:', error);
    return NextResponse.json({ error: 'Error al obtener evento' }, { status: 500 });
  }
}

/**
 * PUT /api/eventos/[id]
 * Registra cambios en un evento (append-only pattern)
 * No modifica la tabla eventos, solo registra en evento_modificaciones
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    console.log('[EVENTOS PUT] Iniciando registro de modificaciones');

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('[EVENTOS PUT] Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: eventId } = await params;
    console.log('[EVENTOS PUT] Usuario ID:', userId, 'Evento ID:', eventId);

    let body;
    try {
      body = await request.json();
      console.log('[EVENTOS PUT] Body recibido:', body);
    } catch (jsonError) {
      console.error('[EVENTOS PUT] Error parseando JSON:', jsonError);
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          details: jsonError instanceof Error ? jsonError.message : String(jsonError),
        },
        { status: 400 },
      );
    }

    const { titulo, descripcion, ubicacion, estado } = body;
    console.log('[EVENTOS PUT] Campos recibidos:', { titulo, descripcion, ubicacion, estado });

    // Validar longitudes máximas
    if (titulo && typeof titulo === 'string' && titulo.length > 200) {
      return NextResponse.json(
        { error: 'El título no puede exceder 200 caracteres' },
        { status: 400 },
      );
    }

    if (ubicacion && typeof ubicacion === 'string' && ubicacion.length > 255) {
      return NextResponse.json(
        { error: 'La ubicación no puede exceder 255 caracteres' },
        { status: 400 },
      );
    }

    // Obtener el evento actual para comparar cambios
    console.log('[EVENTOS PUT] Buscando evento con ID:', eventId);
    const eventoActual = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      include: {
        evento_estado: {
          orderBy: { fecha_de_cambio: 'desc' },
          take: 1,
        },
      },
    });

    if (!eventoActual) {
      console.log('[EVENTOS PUT] Evento no encontrado con ID:', eventId);
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario sea el creador del evento
    if (eventoActual.creadorid !== userId) {
      console.log(
        '[EVENTOS PUT] Acceso denegado. Creador:',
        eventoActual.creadorid,
        'Usuario:',
        userId,
      );
      return NextResponse.json({ error: 'No autorizado para editar este evento' }, { status: 403 });
    }

    console.log('[EVENTOS PUT] Usuario autorizado para editar');

    // Función auxiliar para truncar valores largos
    const truncarValor = (valor: string | null | undefined, maxLength = 500): string | null => {
      if (!valor) return null;
      if (typeof valor !== 'string') return String(valor);
      return valor.length > maxLength ? valor.substring(0, maxLength) + '...' : valor;
    };

    // Registrar cambios en evento_modificaciones
    const camposModificados: Array<{
      campo_modificado: string;
      valor_anterior: string | null;
      valor_nuevo: string | null;
    }> = [];

    if (titulo !== undefined && titulo !== eventoActual.titulo) {
      camposModificados.push({
        campo_modificado: 'titulo',
        valor_anterior: truncarValor(eventoActual.titulo),
        valor_nuevo: truncarValor(titulo),
      });
    }

    if (descripcion !== undefined && descripcion !== eventoActual.descripcion) {
      camposModificados.push({
        campo_modificado: 'descripcion',
        valor_anterior: truncarValor(eventoActual.descripcion),
        valor_nuevo: truncarValor(descripcion),
      });
    }

    if (ubicacion !== undefined && ubicacion !== eventoActual.ubicacion) {
      camposModificados.push({
        campo_modificado: 'ubicacion',
        valor_anterior: truncarValor(eventoActual.ubicacion),
        valor_nuevo: truncarValor(ubicacion),
      });
    }

    // Registrar cambio de estado si se proporciona
    if (estado !== undefined && estado !== eventoActual.evento_estado?.[0]?.Estado) {
      const estadoValido = ['ACTIVO', 'CANCELADO', 'COMPLETADO', 'OCULTO'].includes(estado);
      if (!estadoValido) {
        return NextResponse.json(
          { error: 'Estado inválido. Debe ser: ACTIVO, CANCELADO, COMPLETADO u OCULTO' },
          { status: 400 },
        );
      }

      camposModificados.push({
        campo_modificado: 'estado',
        valor_anterior: eventoActual.evento_estado?.[0]?.Estado || 'OCULTO',
        valor_nuevo: estado,
      });
    }

    // Si no hay cambios, retornar el evento sin modificar
    if (camposModificados.length === 0) {
      console.log('[EVENTOS PUT] No hay cambios para registrar');
      return NextResponse.json(
        { event: eventoActual, message: 'No hay cambios para registrar' },
        { status: 200 },
      );
    }

    console.log('[EVENTOS PUT] Registrando', camposModificados.length, 'cambios');

    // Registrar cada cambio en evento_modificaciones
    await Promise.all(
      camposModificados.map((mod) =>
        prisma.evento_modificaciones.create({
          data: {
            modificacionid: generateId(),
            eventoid: eventId,
            campo_modificado: mod.campo_modificado,
            valor_anterior: mod.valor_anterior,
            valor_nuevo: mod.valor_nuevo,
            usuarioid: userId,
            fecha_modificacion: new Date(),
          },
        }),
      ),
    );

    console.log('[EVENTOS PUT] ✅ Cambios registrados en evento_modificaciones');

    // Si hubo cambio de estado, registrar en evento_estado
    const cambioEstado = camposModificados.find((c) => c.campo_modificado === 'estado');
    if (cambioEstado) {
      console.log('[EVENTOS PUT] Registrando cambio de estado:', cambioEstado.valor_nuevo);
      await prisma.evento_estado.create({
        data: {
          stateventid: generateId(),
          eventoid: eventId,
          Estado: cambioEstado.valor_nuevo!,
          usuarioid: userId,
          fecha_de_cambio: new Date(),
        },
      });
      console.log('[EVENTOS PUT] ✅ Estado registrado en evento_estado');
    }

    // Obtener el evento actualizado con todas sus relaciones
    console.log('[EVENTOS PUT] Obteniendo evento actualizado...');
    const eventoConRelaciones = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      include: {
        stock_entrada: true,
        fechas_evento: true,
        imagenes_evento: true,
        evento_estado: {
          orderBy: { fecha_de_cambio: 'desc' },
          take: 1,
        },
        evento_modificaciones: {
          orderBy: { fecha_modificacion: 'desc' },
          take: 10,
        },
        evento_categorias: {
          include: {
            categoriaevento: true,
          },
        },
      },
    });

    console.log('[EVENTOS PUT] ✅ Evento finalizado, retornando respuesta');

    return NextResponse.json(
      {
        event: eventoConRelaciones,
        message: 'Cambios registrados correctamente',
        cambios: camposModificados,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[EVENTOS PUT] ❌ Error registrando cambios:', error);
    if (error instanceof Error) {
      console.error('[EVENTOS PUT] ❌ Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return NextResponse.json(
      {
        error: 'Error al registrar cambios',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/eventos/[id]
 * Soft delete: registra que el evento fue eliminado (append-only pattern)
 * No borra datos, solo registra cambio de estado a CANCELADO
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    console.log('[EVENTOS DELETE] Iniciando soft delete de evento');

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('[EVENTOS DELETE] Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: eventId } = await params;
    console.log('[EVENTOS DELETE] Usuario ID:', userId, 'Evento ID:', eventId);

    // Obtener el evento actual
    console.log('[EVENTOS DELETE] Buscando evento con ID:', eventId);
    const eventoActual = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      include: {
        evento_estado: {
          orderBy: { fecha_de_cambio: 'desc' },
          take: 1,
        },
      },
    });

    if (!eventoActual) {
      console.log('[EVENTOS DELETE] Evento no encontrado con ID:', eventId);
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario sea el creador del evento
    if (eventoActual.creadorid !== userId) {
      console.log(
        '[EVENTOS DELETE] Acceso denegado. Creador:',
        eventoActual.creadorid,
        'Usuario:',
        userId,
      );
      return NextResponse.json(
        { error: 'No autorizado para eliminar este evento' },
        { status: 403 },
      );
    }

    console.log('[EVENTOS DELETE] Usuario autorizado para eliminar');

    const estadoActual = eventoActual.evento_estado?.[0]?.Estado || 'OCULTO';

    // Si ya está cancelado, no hacer nada
    if (estadoActual === 'CANCELADO') {
      console.log('[EVENTOS DELETE] El evento ya está cancelado');
      return NextResponse.json(
        {
          event: eventoActual,
          message: 'El evento ya estaba cancelado',
          canceled: false,
        },
        { status: 200 },
      );
    }

    console.log('[EVENTOS DELETE] Registrando cambio de estado a CANCELADO');

    // Registrar cambio de estado a CANCELADO en evento_estado
    await prisma.evento_estado.create({
      data: {
        stateventid: generateId(),
        eventoid: eventId,
        Estado: 'CANCELADO',
        usuarioid: userId,
        fecha_de_cambio: new Date(),
      },
    });

    console.log('[EVENTOS DELETE] ✅ Estado CANCELADO registrado en evento_estado');

    // Registrar el cambio en evento_modificaciones para auditoría
    await prisma.evento_modificaciones.create({
      data: {
        modificacionid: generateId(),
        eventoid: eventId,
        campo_modificado: 'estado',
        valor_anterior: estadoActual,
        valor_nuevo: 'CANCELADO',
        usuarioid: userId,
        fecha_modificacion: new Date(),
      },
    });

    console.log('[EVENTOS DELETE] ✅ Cambio registrado en evento_modificaciones');

    // Registrar en eventos_history con change_type: DELETE
    await prisma.eventos_history.create({
      data: {
        history_id: generateId(),
        eventoid: eventId,
        // Copiar todos los campos del evento actual
        titulo: eventoActual.titulo,
        descripcion: eventoActual.descripcion,
        ubicacion: eventoActual.ubicacion,
        creadorid: eventoActual.creadorid,
        mapa_evento: eventoActual.mapa_evento,
        version: eventoActual.version,
        changed_at: new Date(),
        changed_by: userId,
        change_type: 'DELETE',
      },
    });

    console.log('[EVENTOS DELETE] ✅ Registro DELETE creado en eventos_history');

    // Obtener el evento actualizado
    console.log('[EVENTOS DELETE] Obteniendo evento actualizado...');
    const eventoConRelaciones = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
      include: {
        stock_entrada: true,
        fechas_evento: true,
        imagenes_evento: true,
        evento_estado: {
          orderBy: { fecha_de_cambio: 'desc' },
          take: 1,
        },
        evento_modificaciones: {
          orderBy: { fecha_modificacion: 'desc' },
          take: 10,
        },
        evento_categorias: {
          include: {
            categoriaevento: true,
          },
        },
      },
    });

    console.log('[EVENTOS DELETE] ✅ Evento soft-deleted, retornando respuesta');

    return NextResponse.json(
      {
        event: eventoConRelaciones,
        message: 'Evento cancelado correctamente (soft delete)',
        canceled: true,
        canceledAt: new Date(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[EVENTOS DELETE] ❌ Error en soft delete:', error);
    if (error instanceof Error) {
      console.error('[EVENTOS DELETE] ❌ Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return NextResponse.json(
      {
        error: 'Error al cancelar evento',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
