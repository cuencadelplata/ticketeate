import { NextRequest, NextResponse } from 'next/server';
import {
  publicRoutes,
  authRoutes,
  protectedRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
} from './routes';

function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route.endsWith('/*')) {
      const basePath = route.slice(0, -2);
      return pathname.startsWith(basePath);
    }
    return pathname === route;
  });
}

function hasValidSession(request: NextRequest): boolean {
  // Better-auth usa __Secure-better-auth.session_token en producción
  // También puede variar en desarrollo, así que revisamos múltiples posibilidades
  const sessionCookie =
    request.cookies.get('__Secure-better-auth.session_token')?.value ||
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('authToken')?.value;

  return !!sessionCookie;
}

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir rutas de API de auth
  if (pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  // Permitir acceso a assets estáticos
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(jpg|png|gif|svg|ico|webp|woff|woff2|ttf|eot)$/i)
  ) {
    return NextResponse.next();
  }

  // Verificar si tiene sesión válida
  const isLoggedIn = hasValidSession(request);

  const isPublicRoute = isRouteMatch(pathname, publicRoutes);
  const isAuthRoute = isRouteMatch(pathname, authRoutes);
  const isProtectedRoute = isRouteMatch(pathname, protectedRoutes);

  // Si intenta acceder a ruta de auth pero ya está logueado, redirigir a home
  // EXCEPTO /acceso que maneja su propia redirección según el rol
  if (isAuthRoute && isLoggedIn && pathname !== '/acceso') {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  // Si intenta acceder a ruta protegida pero no está logueado, redirigir a login
  if (isProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Permitir acceso a rutas públicas
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Por defecto, permitir acceso
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
