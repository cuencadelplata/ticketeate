import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Call the actual purchases API
    const backendUrl = process.env.PURCHASES_BACKEND_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(search && { search }),
    });

    const response = await fetch(`${backendUrl}/api/purchases?${params}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch purchases');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Purchases API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
