import { NextRequest, NextResponse } from 'next/server';

// Body esperado:
// {
//   id_usuario: number,
//   id_evento: number,
//   cantidad: number,
//   metodo_pago: string
// }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_usuario, id_evento, cantidad, metodo_pago } = body ?? {};

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

    if (!['tarjeta', 'efectivo', 'transferencia'].includes(metodo_pago)) {
      return NextResponse.json(
        {
          error: 'Método de pago no válido. Use: tarjeta, efectivo o transferencia',
        },
        { status: 400 },
      );
    }

    // Simular procesamiento de compra
    const timestamp = Date.now();
    const id_reserva = Math.floor(Math.random() * 10000) + 1000;
    const precio_unitario = 25.0; // Precio fijo para simulación
    const monto_total = precio_unitario * cantidad;

    // Simular respuesta exitosa
    const resultado = {
      reserva: {
        id_reserva,
        id_usuario,
        id_evento,
        cantidad,
        estado: 'pendiente',
        fecha_reserva: new Date().toISOString(),
      },
      pago: {
        id_pago: Math.floor(Math.random() * 10000) + 2000,
        id_reserva,
        metodo_pago,
        monto_total: monto_total.toFixed(2),
        estado: 'pendiente',
        fecha_pago: new Date().toISOString(),
      },
      entradas: Array.from({ length: cantidad }, (_, idx) => ({
        id_entrada: Math.floor(Math.random() * 10000) + 3000 + idx,
        id_reserva,
        codigo_qr: `${id_reserva}-${timestamp}-${idx}`,
        estado: 'valida',
      })),
      resumen: {
        total_entradas: cantidad,
        precio_unitario: precio_unitario.toFixed(2),
        monto_total: monto_total.toFixed(2),
        metodo_pago,
        estado: 'Compra procesada exitosamente',
      },
    };

    // Simular delay de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json(resultado, { status: 201 });
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
