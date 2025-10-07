import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { customSession } from 'better-auth/plugins';
import { prisma } from '@repo/db';
import { Resend } from 'resend';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  url: process.env.BETTER_AUTH_URL,

  // Base de datos
  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  // Email & Password habilitado
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      await resend.emails.send({
        from: 'Ticketeate <noreply@ticketeate.com>',
        to: [user.email],
        subject: 'Restablecer contraseña - Ticketeate',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Restablecer contraseña</h2>
            <p>Hola ${user.name},</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
            <a href="${url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer contraseña</a>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <p>Este enlace expirará en 1 hora.</p>
          </div>
        `,
      });
    },
    sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
      await resend.emails.send({
        from: 'Ticketeate <noreply@ticketeate.com>',
        to: [user.email],
        subject: 'Verificar correo electrónico - Ticketeate',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verificar correo electrónico</h2>
            <p>Hola ${user.name},</p>
            <p>Gracias por registrarte en Ticketeate. Para completar tu registro, verifica tu correo electrónico:</p>
            <a href="${url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar correo</a>
            <p>Si no creaste una cuenta, puedes ignorar este correo.</p>
            <p>Este enlace expirará en 24 horas.</p>
          </div>
        `,
      });
    },
  },

  // OAuth con Google
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // OTP para verificación - DESHABILITADO
  // otp: {
  //   enabled: true,
  //   sendOTP: async ({ email, otp }: { email: string; otp: string }) => {
  //     await resend.emails.send({
  //       from: 'Ticketeate <noreply@ticketeate.com>',
  //       to: [email],
  //       subject: 'Código de verificación - Ticketeate',
  //       html: `
  //         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  //           <h2>Código de verificación</h2>
  //           <p>Tu código de verificación es:</p>
  //           <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
  //             ${otp}
  //           </div>
  //           <p>Este código expirará en 10 minutos.</p>
  //           <p>Si no solicitaste este código, puedes ignorar este correo.</p>
  //         </div>
  //       `,
  //     });
  //   },
  // },

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
