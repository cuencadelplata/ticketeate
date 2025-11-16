export type AppRole = 'ORGANIZADOR' | 'COLABORADOR' | 'USUARIO';

export function roleToPath(role?: AppRole) {
  switch (role) {
    case 'ORGANIZADOR':
      return '/eventos';
    case 'COLABORADOR':
      return '/colaborador/scanner';
    case 'USUARIO':
    default:
      return '/';
  }
}
