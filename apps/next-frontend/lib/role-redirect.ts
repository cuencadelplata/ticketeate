export type AppRole = 'ORGANIZADOR' | 'COLABORADOR' | 'USUARIO';

export function roleToPath(role?: AppRole) {
  switch (role) {
    case 'ORGANIZADOR':
      return '/evento/manage';
    case 'COLABORADOR':
      return '/evento/manage';
    default:
      return '/eventos';
  }
}
