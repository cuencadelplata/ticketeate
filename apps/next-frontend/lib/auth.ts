import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { customSession, emailOTP } from 'better-auth/plugins';
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
    requireEmailVerification: false, // Permitir registro pero verificar después
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      await resend.emails.send({
        from: 'Ticketeate <noreply@ticketeate.page>',
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
        from: 'Ticketeate <noreply@ticketeate.page>',
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

  plugins: [
    // Plugin de OTP para verificación por email
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[OTP] Sending ${type} code to ${email}:`, otp);
        
        const subjects = {
          'sign-in': 'Código de inicio de sesión - Ticketeate',
          'email-verification': 'Verificar correo electrónico - Ticketeate',
          'forget-password': 'Código para restablecer contraseña - Ticketeate',
        };

        const titles = {
          'sign-in': 'Código de inicio de sesión',
          'email-verification': 'Verificar correo electrónico',
          'forget-password': 'Restablecer contraseña',
        };

        try {
          const { data, error } = await resend.emails.send({
            from: 'Ticketeate <onboarding@ticketeate.page>', // Usar dominio de Resend hasta configurar uno propio
            to: [email],
            subject: subjects[type] || 'Código de verificación - Ticketeate',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">${titles[type] || 'Código de verificación'}</h2>
                <p style="color: #666;">Tu código de verificación es:</p>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 5px; margin: 20px 0; color: #333;">
                  ${otp}
                </div>
                <p style="color: #666;">Este código expirará en 10 minutos.</p>
                <p style="color: #999; font-size: 14px;">Si no solicitaste este código, puedes ignorar este correo.</p>
              </div>
            `,
          });

          if (error) {
            console.error('[OTP] Resend error:', error);
            throw new Error(`Failed to send OTP: ${error.message}`);
          }

          console.log('[OTP] Email sent successfully:', data);
        } catch (error) {
          console.error('[OTP] Failed to send email:', error);
          // En desarrollo, mostrar el código en la consola como fallback
          if (process.env.NODE_ENV === 'development') {
            console.log('═══════════════════════════════════');
            console.log(`📧 OTP CODE FOR ${email}`);
            console.log(`   ${otp}`);
            console.log('═══════════════════════════════════');
          }
          throw error;
        }
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutos
      sendVerificationOnSignUp: true, // Enviar OTP automáticamente al registrarse
    }),
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
          emailVerified: fullUser?.emailVerified || false,
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
