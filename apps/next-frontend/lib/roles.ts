

export const ROLES = {
  CLIENTE: 'USUARIO',
  ADMIN: 'ORGANIZADOR',
} as const;

// Roles que realmente se guardan en la DB (enum Role de Prisma)
export type DbRole = (typeof ROLES)[keyof typeof ROLES];  // 'USUARIO' | 'ORGANIZADOR'

// Helpers de uso rápido
export const isAdmin = (role?: string | null) => role === ROLES.ADMIN;
export const isCliente = (role?: string | null) => role === ROLES.CLIENTE;
