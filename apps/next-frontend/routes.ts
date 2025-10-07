<<<<<<< HEAD
export const publicRoutes: string[] = ['/', '/about', '/crear', '/historial', '/test-historial'];
=======
export const publicRoutes: string[] = ['/', '/about', '/crear', '/productoras', '/descubrir/*'];
>>>>>>> 77694174bb6fcb6032ff9dbb713c884f6cc43a87

export const authRoutes: string[] = ['/sign-in', '/sign-up', '/forgot-password'];

export const protectedRoutes: string[] = ['/evento/manage/*', '/eventos', '/configuracion/*'];

export const apiAuthPrefix: string = '/api/auth';

export const DEFAULT_LOGIN_REDIRECT: string = '/';
