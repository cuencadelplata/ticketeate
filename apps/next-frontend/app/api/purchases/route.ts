import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PurchaseService, CreatePurchaseData } from '@/lib/purchases';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, ticketOptionId, quantity, totalAmount, paymentMethod, paymentId } = body;

    // Validar datos requeridos
    if (!eventId || !quantity || totalAmount === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: eventId, quantity, totalAmount' },
        { status: 400 }
      );
    }

    // Validar que quantity sea un número positivo
    if (quantity <= 0) {
      return NextResponse.json({ error: 'La cantidad debe ser mayor a 0' }, { status: 400 });
    }

    // Validar que totalAmount sea un número no negativo
    if (totalAmount < 0) {
      return NextResponse.json({ error: 'El monto total no puede ser negativo' }, { status: 400 });
    }

    // Preparar datos para crear la compra
    const purchaseData: CreatePurchaseData = {
      userId,
      eventId,
      ticketOptionId,
      quantity,
      totalAmount,
      paymentMethod,
      paymentId,
    };

    // Crear la compra
    const newPurchase = await PurchaseService.createPurchase(purchaseData);

    return NextResponse.json(
      {
        success: true,
        data: newPurchase,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/purchases:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
