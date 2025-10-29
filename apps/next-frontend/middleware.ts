import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  publicRoutes,
  protectedRoutes,
} from './routes';

export async function middleware(request: NextRequest) {
  const session = getSessionCookie(request);

  const isApiAuth = request.nextUrl.pathname.startsWith(apiAuthPrefix);

  const isPublicRoute = publicRoutes.some((route) => {
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2);
      return request.nextUrl.pathname.startsWith(baseRoute);
    }
    return request.nextUrl.pathname === route;
  });

  const isProtectedRoute = protectedRoutes.some((route) => {
    if (route.endsWith('/*')) {
      const baseRoute = route.slice(0, -2);
      return request.nextUrl.pathname.startsWith(baseRoute);
    }
    return request.nextUrl.pathname === route;
  });

  const isAuthRoute = () => {
    return authRoutes.some((path) => request.nextUrl.pathname.startsWith(path));
  };

  if (isApiAuth) {
    return NextResponse.next();
  }

  if (isAuthRoute()) {
    if (session) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
    }
    return NextResponse.next();
  }

  // Proteger rutas específicas
  if (isProtectedRoute && !session) {
    const back = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/sign-in?redirect_url=${back}`, request.url));
  }

  // Si no hay sesión y no es una ruta pública, redirigir al login
  if (!session && !isPublicRoute && !isAuthRoute()) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
