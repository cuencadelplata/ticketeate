import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PurchaseService } from '@/lib/purchases';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Usuario no autenticado' }, { status: 401 });
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';

    // Obtener historial de compras
    const purchaseHistory = await PurchaseService.getUserPurchaseHistory(userId);

    // Obtener estadísticas si se solicitan
    let stats = null;
    if (includeStats) {
      stats = await PurchaseService.getUserPurchaseStats(userId);
    }

    return NextResponse.json({
      success: true,
      data: {
        purchases: purchaseHistory,
        stats,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/purchases/history:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor',
      },
      { status: 500 }
    );
  }
}
