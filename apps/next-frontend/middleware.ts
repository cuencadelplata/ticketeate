import { NextResponse, type NextRequest } from 'next/server';

import { apiAuthPrefix, authRoutes, publicRoutes, protectedRoutes } from './routes';

function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Permitir siempre rutas de API de autenticación
  if (pathname.startsWith(apiAuthPrefix)) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // Helper para verificar rutas con wildcards
  const matchesRoute = (route: string, path: string): boolean => {
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2);
      return path.startsWith(baseRoute);
    }
    return path === route;
  };

  // 2. Verificar si es ruta de autenticación (/sign-in, /sign-up, etc)
  const isAuthRoute = authRoutes.some((route) => matchesRoute(route, pathname));

  if (isAuthRoute) {
    // Siempre permitir acceso a rutas de autenticación
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // 3. Verificar si es ruta pública (siempre permitir)
  const isPublicRoute = publicRoutes.some((route) => matchesRoute(route, pathname));

  if (isPublicRoute) {
    const response = NextResponse.next();
    addSecurityHeaders(response);
    return response;
  }

  // 4. Para rutas protegidas, verificar la sesión
  const isProtectedRoute = protectedRoutes.some((route) => matchesRoute(route, pathname));

  if (isProtectedRoute) {
    // Verificar si tiene cookie de sesión
    const sessionToken = request.cookies.get('better-auth.session_token');

    if (!sessionToken) {
      const back = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/sign-in?redirect_url=${back}`, request.url));
    }
  }

  // 5. Para cualquier otra ruta, permitir acceso
  const response = NextResponse.next();
  addSecurityHeaders(response);
  return response;
}

function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://res.cloudinary.com https://avatars.githubusercontent.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export default middleware;
