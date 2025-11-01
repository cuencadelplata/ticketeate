import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@/services/coupon-service';
import { auth } from '@clerk/nextjs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const result = await CouponService.redeemCoupon({
      ...data,
      usuarioid: userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error al redimir cupón:', error);
    return NextResponse.json(
      { error: 'Error al redimir el cupón' },
      { status: 500 }
    );
  }
}