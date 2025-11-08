export type AppRole = 'ORGANIZADOR' | 'COLABORADOR' | 'USUARIO';

export function roleToPath(role?: AppRole) {
  switch (role) {
    case 'ORGANIZADOR':
      return '/eventos';
    case 'COLABORADOR':
      return '/eventos';
    case 'USUARIO':
    default:
      return '/';
  }
}
