// Rutas públicas - accesibles sin autenticación
export const publicRoutes: string[] = [
  '/',
  '/about',
  '/crear',
  '/productoras',
  '/descubrir/*',
  '/evento/*', // Ver detalles de eventos públicos
];

// Rutas de autenticación - solo accesibles sin sesión
export const authRoutes: string[] = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-otp',
];

// Rutas protegidas - requieren autenticación
export const protectedRoutes: string[] = [
  '/evento/manage/*', // Gestión de eventos
  '/eventos', // Mis eventos (como organizador)
  '/configuracion',
  '/configuracion/*',
  '/profile', // Perfil de usuario
];

export const apiAuthPrefix: string = '/api/auth';

export const DEFAULT_LOGIN_REDIRECT: string = '/';
