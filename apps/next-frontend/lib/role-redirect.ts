export type AppRole = 'ORGANIZADOR' | 'USUARIO';

export function roleToPath(role?: AppRole) {
  switch (role) {
    case 'ORGANIZADOR':
      return '/eventos';
    case 'USUARIO':
    default:
      return '/';
  }
}
