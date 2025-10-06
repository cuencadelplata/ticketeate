import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { customSession } from 'better-auth/plugins';
import { prisma } from '@repo/db';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is not set');
}

export const auth = betterAuth({
  url: process.env.BETTER_AUTH_URL,

  // Base de datos
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  // Email & Password habilitado
  emailAndPassword: { enabled: true },

  plugins: [
    customSession(async ({ user, session }) => {
      // Obtener el usuario completo de la base de datos para incluir el rol
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        user: {
          ...user,
          role: fullUser?.role || 'USUARIO',
        },
        session: {
          ...session,
          role: fullUser?.role || 'USUARIO',
        },
      };
    }),
  ],

  callbacks: {
    async signIn({ user }: { user: { id: string; role?: string } }) {
      // Si el user no tiene rol, asignar USUARIO por defecto
      if (!(user as any)?.role) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'USUARIO' },
        });
      }
      return true;
    },
  },
});

export default auth;
