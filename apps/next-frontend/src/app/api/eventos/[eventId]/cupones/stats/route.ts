import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@/services/coupon-service';

export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const stats = await CouponService.getCouponStats(params.eventId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de cupones:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas de cupones' },
      { status: 500 }
    );
  }
}