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
  '/eventos', // Mis eventos (como organizador) - PRIVADO
  '/eventos/*',
  '/evento/manage/*', // Gestión de eventos
  '/colaborador/*', // Rutas para colaboradores (scanner, etc)
  '/configuracion',
  '/configuracion/*',
  '/profile', // Perfil de usuario
  '/deploys',
];

export const apiAuthPrefix: string = '/api/auth';

export const DEFAULT_LOGIN_REDIRECT: string = '/';
