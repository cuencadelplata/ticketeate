import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { prismaAdapter } from 'better-auth/adapters/prisma';
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

  jwt: {
    enabled: true,
    async onGenerate({ token, user }: { token: Record<string, any>; user: { role?: string } }) {
      (token as any).role = (user as any)?.role ?? 'USUARIO';
      return token;
    },
  },

  callbacks: {
    async session({ session, user }: { session: Record<string, any>; user: { role?: string } }) {
      (session as any).role = (user as any)?.role ?? 'USUARIO';
      return session;
    },
    async signIn({ user }: { user: { id: string; role?: string } }) {
      // Si el user no tiene rol
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
