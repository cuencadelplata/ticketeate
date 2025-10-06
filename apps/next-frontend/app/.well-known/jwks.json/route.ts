import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Obtener las claves JWKS desde Better Auth
    const jwks = await auth.api.getJwks();
    
    return NextResponse.json(jwks, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    });
  } catch (error) {
    console.error('Error fetching JWKS:', error);
    
    // Fallback: devolver un JWKS vacío si hay error
    return NextResponse.json({
      keys: []
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}
