import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/db';

// Body esperado:
// {
//   id_usuario: number,
//   id_evento: number,
//   cantidad: number,
//   metodo_pago: 'tarjeta_credito' | 'tarjeta_debito',
//   datos_tarjeta?: { numero: string; vencimiento: string; cvv: string; dni: string }
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id_usuario,
      id_evento,
      id_categoria, // opcional si se compra por categoria de entrada
      cantidad,
      metodo_pago,
      datos_tarjeta,
    } = body ?? {};

    if (!id_usuario || !id_evento || !cantidad || !metodo_pago) {
      return NextResponse.json(
        {
          error: 'Faltan campos requeridos',
          campos_requeridos: ['id_usuario', 'id_evento', 'cantidad', 'metodo_pago'],
        },
        { status: 400 },
      );
    }

    // Validaciones simples
    if (cantidad <= 0 || cantidad > 10) {
      return NextResponse.json(
        {
          error: 'Cantidad debe estar entre 1 y 10',
        },
        { status: 400 },
      );
    }

    if (!['tarjeta_credito', 'tarjeta_debito'].includes(metodo_pago)) {
      return NextResponse.json(
        {
          error: 'Método de pago no válido. Use: tarjeta_credito o tarjeta_debito',
        },
        { status: 400 },
      );
    }

    // Validar datos de tarjeta (demo - no procesar reales en servidor sin PCI)
    if (['tarjeta_credito', 'tarjeta_debito'].includes(metodo_pago)) {
      const numeroOk =
        typeof datos_tarjeta?.numero === 'string' && /^\d{13,19}$/.test(datos_tarjeta.numero);
      const vencOk =
        typeof datos_tarjeta?.vencimiento === 'string' &&
        /^(0[1-9]|1[0-2])\/\d{2}$/.test(datos_tarjeta.vencimiento.trim());
      const cvvOk =
        typeof datos_tarjeta?.cvv === 'string' && /^\d{3,4}$/.test(datos_tarjeta.cvv.trim());
      const dniOk =
        typeof datos_tarjeta?.dni === 'string' && /^\d{7,10}$/.test(datos_tarjeta.dni.trim());
      if (!numeroOk || !vencOk || !cvvOk || !dniOk) {
        return NextResponse.json(
          {
            error: 'Datos de tarjeta inválidos',
            campos_requeridos: [
              'datos_tarjeta.numero (13-19 dígitos)',
              'datos_tarjeta.vencimiento (MM/AA)',
              'datos_tarjeta.cvv (3-4 dígitos)',
              'datos_tarjeta.dni (7-10 dígitos)',
            ],
          },
          { status: 400 },
        );
      }
    }

    // 1) Validar usuario, evento y categoría
    // Crear el usuario si no existe (placeholder)
    const usuario = await prisma.usuario.upsert({
      where: { id_usuario: String(id_usuario) },
      update: {},
      create: {
        id_usuario: String(id_usuario),
        nombre: 'Invitado',
        apellido: 'App',
        email: `${String(id_usuario)}@placeholder.local`,
      },
    });

    const evento = await prisma.evento.findUnique({ where: { id_evento: String(id_evento) } });
    if (!evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    // Buscar una fecha válida del evento (si no existe, se creará en la transacción)
    const fecha = await prisma.fechaEvento.findFirst({ where: { id_evento: String(id_evento) } });

    let categoria = null as null | { id_categoria: string; precio: any; stock_disponible: number };
    if (id_categoria) {
      // Permitir id o nombre de categoría (asociada al evento)
      categoria = (await prisma.categoriaEntrada.findUnique({
        where: { id_categoria: String(id_categoria) },
        select: { id_categoria: true, precio: true, stock_disponible: true },
      })) as any;
      if (!categoria) {
        categoria = (await prisma.categoriaEntrada.findFirst({
          where: { id_evento: String(id_evento), nombre: String(id_categoria) },
          select: { id_categoria: true, precio: true, stock_disponible: true },
        })) as any;
      }
      if (!categoria) {
        return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
      }
    } else {
      // tomar la primera categoría disponible del evento
      categoria = (await prisma.categoriaEntrada.findFirst({
        where: { id_evento: String(id_evento), stock_disponible: { gt: 0 } },
        orderBy: { precio: 'asc' },
        select: { id_categoria: true, precio: true, stock_disponible: true },
      })) as any;
      if (!categoria) {
        return NextResponse.json({ error: 'Sin categorías disponibles' }, { status: 409 });
      }
    }

    // 2) Ejecutar transacción atómica
    const resultadoTx = await prisma.$transaction(async (tx: any) => {
      // Revalidar stock con bloqueo optimista (chequeo y update condicional)
      const catActual = await tx.categoriaEntrada.findUnique({
        where: { id_categoria: categoria!.id_categoria },
        select: { stock_disponible: true, precio: true },
      });
      if (!catActual || catActual.stock_disponible < cantidad) {
        throw new Error('Stock insuficiente');
      }

      // Descontar stock
      await tx.categoriaEntrada.update({
        where: { id_categoria: categoria!.id_categoria },
        data: { stock_disponible: { decrement: cantidad } },
      });

      // Asegurar fecha: si no existe, crear una por defecto usando fecha_inicio_venta o NOW
      let fechaId = fecha?.id_fecha as string | undefined;
      if (!fechaId) {
        const nuevaFecha = await tx.fechaEvento.create({
          data: {
            id_evento: String(id_evento),
            fecha_hora: (evento as any).fecha_inicio_venta ?? new Date(),
          },
        });
        fechaId = nuevaFecha.id_fecha;
      }

      // Crear reserva en estado PENDIENTE con relaciones conectadas
      console.log('[api/comprar] creando reserva con connect', {
        id_usuario: String(id_usuario),
        id_evento: String(id_evento),
        id_fecha: String(fechaId),
        id_categoria: categoria!.id_categoria,
        cantidad: Number(cantidad),
      });
      const reserva = await tx.reserva.create({
        data: {
          usuario: { connect: { id_usuario: String(id_usuario) } },
          evento: { connect: { id_evento: String(id_evento) } },
          fecha: { connect: { id_fecha: String(fechaId) } },
          categoria: { connect: { id_categoria: categoria!.id_categoria } },
          cantidad: Number(cantidad),
          estado: 'PENDIENTE',
        },
      });

      // Crear pago
      const monto_total = Number(catActual.precio) * Number(cantidad);
      const pago = await tx.pago.create({
        data: {
          id_reserva: reserva.id_reserva,
          metodo_pago: String(metodo_pago),
          monto_total,
          estado: 'PENDIENTE',
        },
      });

      // Crear entradas
      const entradas = [] as Array<{ id_entrada: string; codigo_qr: string }>;
      for (let i = 0; i < Number(cantidad); i++) {
        const qr = `${reserva.id_reserva}-${Date.now()}-${i}`;
        const ent = await tx.entrada.create({
          data: {
            id_reserva: reserva.id_reserva,
            codigo_qr: qr,
            estado: 'VALIDA',
          },
        });
        entradas.push({ id_entrada: ent.id_entrada, codigo_qr: qr });
      }

      return { reserva, pago, entradas, monto_total };
    });

    return NextResponse.json(
      {
        reserva: resultadoTx.reserva,
        pago: {
          ...resultadoTx.pago,
          tarjeta: datos_tarjeta
            ? { dni: datos_tarjeta.dni, ultimos4: String(datos_tarjeta.numero || '').slice(-4) }
            : undefined,
        },
        entradas: resultadoTx.entradas,
        resumen: {
          total_entradas: cantidad,
          precio_unitario: undefined,
          monto_total: resultadoTx.monto_total,
          metodo_pago,
          estado: 'Compra procesada exitosamente',
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error en /api/comprar', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        detalles: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 },
    );
  }
}
