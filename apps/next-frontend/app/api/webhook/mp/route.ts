import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // TODO: Implement MercadoPago webhook handler
    console.log('MercadoPago webhook received');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MercadoPago webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
