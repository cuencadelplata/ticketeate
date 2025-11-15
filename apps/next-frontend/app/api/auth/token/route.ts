import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Verificar la sesión del usuario
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Crear payload JWT
    const payload = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role || 'USUARIO',
      name: session.user.name,
    };

    // Generar token JWT manualmente
    const token = jwt.sign(payload, process.env.BETTER_AUTH_SECRET!, {
      issuer: process.env.FRONTEND_URL || 'http://localhost:3000',
      audience: process.env.FRONTEND_URL || 'http://localhost:3000',
      expiresIn: '1h',
      algorithm: 'HS256',
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating JWT token:', error);
    return NextResponse.json({ error: 'Failed to generate JWT token' }, { status: 500 });
  }
}
