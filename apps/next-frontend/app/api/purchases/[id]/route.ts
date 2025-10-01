import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PurchaseService } from '@/lib/purchases';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const purchaseId = params.id;

    if (!purchaseId) {
      return NextResponse.json({ error: 'ID de compra requerido' }, { status: 400 });
    }

    // Obtener la compra específica
    const purchase = await PurchaseService.getPurchaseById(purchaseId);

    if (!purchase) {
      return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 });
    }

    // TODO: Verificar que la compra pertenece al usuario autenticado
    // Esto se puede hacer agregando una verificación adicional en el servicio

    return NextResponse.json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error('Error in GET /api/purchases/[id]:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    const purchaseId = params.id;

    if (!purchaseId) {
      return NextResponse.json({ error: 'ID de compra requerido' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Estado requerido' }, { status: 400 });
    }

    // Validar estados permitidos
    const allowedStatuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
    }

    // Actualizar el estado de la compra
    const updatedPurchase = await PurchaseService.updatePurchaseStatus(purchaseId, status);

    return NextResponse.json({
      success: true,
      data: updatedPurchase,
    });
  } catch (error) {
    console.error('Error in PATCH /api/purchases/[id]:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
