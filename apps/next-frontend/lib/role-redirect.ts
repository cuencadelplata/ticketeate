export type AppRole = 'ADMIN' | 'ORGANIZADOR' | 'USUARIO';

export function roleToPath(role?: AppRole) {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'ORGANIZADOR':
      return '/evento/manage';
    default:
      return '/eventos';
  }
}
