import { prisma } from '@repo/db';
import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from './../../services/coupon-service';

export async function GET(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const cupones = await CouponService.getEventCoupons(params.eventId);
    return NextResponse.json(cupones);
  } catch (error) {
    console.error('Error al obtener cupones:', error);
    return NextResponse.json({ error: 'Error al obtener cupones del evento' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const data = await req.json();
    data.eventoid = params.eventId;
    const cupon = await CouponService.createCoupon(data);
    return NextResponse.json(cupon, { status: 201 });
  } catch (error) {
    console.error('Error al crear cupón:', error);
    return NextResponse.json({ error: 'Error al crear el cupón' }, { status: 500 });
  }
}
