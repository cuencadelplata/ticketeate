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
 * Actualiza un evento (soft update con registro de modificaciones)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    console.log('[EVENTOS PUT] Iniciando actualización de evento');

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('[EVENTOS PUT] Usuario no autenticado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('[EVENTOS PUT] Usuario ID:', userId);

    const { id: eventId } = await params;
    console.log('[EVENTOS PUT] Event ID:', eventId);

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
      console.log(
        '[EVENTOS PUT] ❌ Título demasiado largo:',
        titulo.length,
        'caracteres (máx 200)',
      );
      return NextResponse.json(
        { error: 'El título no puede exceder 200 caracteres' },
        { status: 400 },
      );
    }

    if (ubicacion && typeof ubicacion === 'string' && ubicacion.length > 255) {
      console.log(
        '[EVENTOS PUT] ❌ Ubicación demasiado larga:',
        ubicacion.length,
        'caracteres (máx 255)',
      );
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
    console.log('[EVENTOS PUT] Evento encontrado:', eventoActual ? 'Sí' : 'No');

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

    // Validar que al menos un campo esté siendo actualizado
    const camposActualizar: any = {};
    const camposModificados: Array<{
      campo: string;
      valorAnterior: string | null;
      valorNuevo: string | null;
    }> = [];

    // Función auxiliar para truncar valores largos
    const truncarValor = (valor: string | null | undefined, maxLength = 500): string | null => {
      if (!valor) return null;
      if (typeof valor !== 'string') return String(valor);
      return valor.length > maxLength ? valor.substring(0, maxLength) + '...' : valor;
    };

    if (titulo !== undefined && titulo !== eventoActual.titulo) {
      camposActualizar.titulo = titulo;
      camposModificados.push({
        campo: 'titulo',
        valorAnterior: truncarValor(eventoActual.titulo),
        valorNuevo: truncarValor(titulo),
      });
    }

    if (descripcion !== undefined && descripcion !== eventoActual.descripcion) {
      camposActualizar.descripcion = descripcion;
      camposModificados.push({
        campo: 'descripcion',
        valorAnterior: truncarValor(eventoActual.descripcion),
        valorNuevo: truncarValor(descripcion),
      });
    }

    if (ubicacion !== undefined && ubicacion !== eventoActual.ubicacion) {
      camposActualizar.ubicacion = ubicacion;
      camposModificados.push({
        campo: 'ubicacion',
        valorAnterior: truncarValor(eventoActual.ubicacion),
        valorNuevo: truncarValor(ubicacion),
      });
    }

    // Actualizar estado si se proporciona
    if (estado !== undefined && estado !== eventoActual.evento_estado?.[0]?.Estado) {
      const estadoValido = ['ACTIVO', 'CANCELADO', 'COMPLETADO', 'OCULTO'].includes(estado);
      if (!estadoValido) {
        return NextResponse.json(
          { error: 'Estado inválido. Debe ser: ACTIVO, CANCELADO, COMPLETADO u OCULTO' },
          { status: 400 },
        );
      }

      camposModificados.push({
        campo: 'estado',
        valorAnterior: eventoActual.evento_estado?.[0]?.Estado || 'OCULTO',
        valorNuevo: estado,
      });
    }

    // Si no hay cambios, retornar el evento sin modificar
    if (Object.keys(camposActualizar).length === 0 && !estado) {
      console.log('[EVENTOS PUT] No hay cambios para actualizar');
      return NextResponse.json(
        { event: eventoActual, message: 'No hay cambios para actualizar' },
        { status: 200 },
      );
    }

    console.log('[EVENTOS PUT] Campos a actualizar:', camposActualizar);

    // Actualizar el evento - Filtrar undefined values
    camposActualizar.fecha_cambio = new Date();
    camposActualizar.version = (eventoActual.version || 1) + 1;
    camposActualizar.updated_by = userId;

    // Remover campos con valor undefined
    const updateData = Object.fromEntries(
      Object.entries(camposActualizar).filter(([_, v]) => v !== undefined),
    );

    console.log('[EVENTOS PUT] Actualizando evento en BD...');
    console.log('[EVENTOS PUT] Datos finales para update:', JSON.stringify(updateData, null, 2));
    console.log('[EVENTOS PUT] Claves en updateData:', Object.keys(updateData));
    console.log(
      '[EVENTOS PUT] Tipos de valores:',
      Object.entries(updateData).map(([k, v]) => `${k}: ${typeof v}`),
    );

    // Validar que no haya valores problemáticos
    for (const [key, value] of Object.entries(updateData)) {
      if (typeof value === 'object' && !(value instanceof Date)) {
        console.log(`[EVENTOS PUT] ⚠️ Campo ${key} es un objeto:`, value);
      }
    }

    // Update sin include - solo update
    // Usar raw SQL para evitar el bug de Prisma con 'new'
    console.log('[EVENTOS PUT] 📍 Ejecutando update con SQL raw...');

    try {
      // Construir el UPDATE dinámicamente basado en los campos que cambiaron
      const setClause = Object.keys(updateData)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(', ');
      const values = Object.values(updateData);
      values.push(eventId); // Agregar eventId al final para el WHERE

      const sql = `UPDATE eventos SET ${setClause} WHERE eventoid = $${values.length}`;
      console.log('[EVENTOS PUT] 📍 SQL:', sql);
      console.log('[EVENTOS PUT] 📍 Values:', values.length, 'parámetros');

      await prisma.$executeRawUnsafe(sql, ...values);
      console.log('[EVENTOS PUT] ✅ Evento actualizado con raw SQL');
    } catch (rawError) {
      console.log('[EVENTOS PUT] ❌ Raw SQL falló:', rawError);
      // Fallback a Prisma normal
      const eventoActualizado = await prisma.eventos.update({
        where: { eventoid: eventId },
        data: updateData,
      });
      console.log('[EVENTOS PUT] ✅ Evento actualizado con Prisma');
    }

    // Obtener el evento actualizado con todas sus relaciones en una query separada
    console.log('[EVENTOS PUT] Obteniendo evento actualizado con relaciones...');

    // Registrar los cambios en evento_modificaciones
    if (camposModificados.length > 0) {
      console.log('[EVENTOS PUT] Registrando', camposModificados.length, 'modificaciones');
      await Promise.all(
        camposModificados.map((mod) =>
          prisma.evento_modificaciones.create({
            data: {
              modificacionid: generateId(),
              eventoid: eventId,
              campo_modificado: mod.campo,
              valor_anterior: mod.valorAnterior,
              valor_nuevo: mod.valorNuevo,
              usuarioid: userId,
              fecha_modificacion: new Date(),
            },
          }),
        ),
      );
      console.log('[EVENTOS PUT] Modificaciones registradas exitosamente');
    }

    // Actualizar estado del evento si se proporciona
    if (estado) {
      console.log('[EVENTOS PUT] Registrando cambio de estado:', estado);
      await prisma.evento_estado.create({
        data: {
          stateventid: generateId(),
          eventoid: eventId,
          Estado: estado,
          usuarioid: userId,
          fecha_de_cambio: new Date(),
        },
      });
      console.log('[EVENTOS PUT] Estado actualizado exitosamente');
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
    console.log('[EVENTOS PUT] Evento finalizado, retornando respuesta');

    return NextResponse.json(
      {
        event: eventoConRelaciones,
        message: 'Evento actualizado correctamente',
        modificaciones: camposModificados,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[EVENTOS PUT] ❌ Error actualizando evento:', error);
    if (error instanceof Error) {
      console.error('[EVENTOS PUT] ❌ Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    // Log adicional para Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('[EVENTOS PUT] ❌ Prisma error code:', (error as any).code);
      console.error('[EVENTOS PUT] ❌ Prisma error meta:', (error as any).meta);
    }
    return NextResponse.json(
      {
        error: 'Error al actualizar evento',
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.name : typeof error,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/eventos/[id]
 * Elimina un evento (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  try {
    console.log('[EVENTOS DELETE] 📍 Iniciando soft delete...');

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log('[EVENTOS DELETE] ❌ No autorizado - sin sesión');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: eventId } = await params;
    console.log('[EVENTOS DELETE] 📍 Usuario:', userId, 'Evento:', eventId);
    console.log(
      '[EVENTOS DELETE] 📍 Validando userId - Type:',
      typeof userId,
      'Length:',
      userId?.length,
    );

    // Obtener el evento actual
    console.log('[EVENTOS DELETE] 📍 Buscando evento en BD...');
    const evento = await prisma.eventos.findUnique({
      where: { eventoid: eventId },
    });

    if (!evento) {
      console.log('[EVENTOS DELETE] ❌ Evento no encontrado:', eventId);
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    console.log('[EVENTOS DELETE] ✅ Evento encontrado:', {
      eventoid: evento.eventoid,
      creadorid: evento.creadorid,
      is_active: evento.is_active,
    });

    // Verificar que el usuario sea el creador del evento
    if (evento.creadorid !== userId) {
      console.log('[EVENTOS DELETE] ❌ No autorizado - usuario no es creador');
      return NextResponse.json(
        { error: 'No autorizado para eliminar este evento' },
        { status: 403 },
      );
    }

    // Realizar soft delete - Usando raw query para evitar problemas de Prisma
    console.log('[EVENTOS DELETE] 📍 Actualizando evento con soft delete...');
    const deleteData = {
      deleted_at: new Date(),
      is_active: false,
    };
    console.log('[EVENTOS DELETE] 📍 Data para delete:', JSON.stringify(deleteData, null, 2));

    // Usar raw SQL para evitar el bug de Prisma con 'new'
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE eventos SET deleted_at = $1, is_active = $2 WHERE eventoid = $3`,
        new Date(),
        false,
        eventId,
      );
      console.log('[EVENTOS DELETE] ✅ Evento actualizado con raw SQL');
    } catch (rawError) {
      console.log('[EVENTOS DELETE] ❌ Raw SQL falló, intentando con Prisma normal:', rawError);
      await prisma.eventos.update({
        where: { eventoid: eventId },
        data: deleteData,
      });
    }
    console.log('[EVENTOS DELETE] ✅ Evento actualizado');

    // Registrar la eliminación en evento_modificaciones
    console.log('[EVENTOS DELETE] 📍 Creando registro de modificación...');
    await prisma.evento_modificaciones.create({
      data: {
        modificacionid: generateId(),
        eventoid: eventId,
        campo_modificado: 'estado',
        valor_anterior: 'ACTIVO',
        valor_nuevo: 'ELIMINADO',
        usuarioid: userId,
        fecha_modificacion: new Date(),
      },
    });
    console.log('[EVENTOS DELETE] ✅ Registro de modificación creado');

    console.log('[EVENTOS DELETE] ✅ Soft delete completado exitosamente');
    return NextResponse.json(
      {
        message: 'Evento eliminado correctamente',
        eventoid: eventId,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[EVENTOS DELETE] ❌ Error eliminando evento:', error);
    if (error instanceof Error) {
      console.error('[EVENTOS DELETE] ❌ Detalles del error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    // Log adicional para Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('[EVENTOS DELETE] ❌ Prisma error code:', (error as any).code);
      console.error('[EVENTOS DELETE] ❌ Prisma error meta:', (error as any).meta);
    }
    return NextResponse.json(
      {
        error: 'Error al eliminar evento',
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.name : typeof error,
      },
      { status: 500 },
    );
  }
}
