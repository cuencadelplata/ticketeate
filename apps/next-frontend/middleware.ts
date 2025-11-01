import { NextResponse, type NextRequest } from 'next/server';

import { apiAuthPrefix, authRoutes, publicRoutes, protectedRoutes } from './routes';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Permitir siempre rutas de API de autenticación
  if (pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
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
    return NextResponse.next();
  }

  // 3. Verificar si es ruta pública (siempre permitir)
  const isPublicRoute = publicRoutes.some((route) => matchesRoute(route, pathname));

  if (isPublicRoute) {
    return NextResponse.next();
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
