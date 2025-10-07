export const publicRoutes: string[] = ['/', '/about', '/crear', '/productoras', '/descubrir/*'];

export const authRoutes: string[] = ['/sign-in', '/sign-up', '/forgot-password'];

export const protectedRoutes: string[] = ['/evento/manage/*', '/eventos', '/configuracion/*'];

export const apiAuthPrefix: string = '/api/auth';

export const DEFAULT_LOGIN_REDIRECT: string = '/';
