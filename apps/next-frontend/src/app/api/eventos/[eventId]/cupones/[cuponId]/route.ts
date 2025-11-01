import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@/services/coupon-service';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { eventId: string; cuponId: string } }
) {
  try {
    await CouponService.deleteCoupon(params.cuponId);
    return NextResponse.json({ message: 'Cupón eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar cupón:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el cupón' },
      { status: 500 }
    );
  }
}