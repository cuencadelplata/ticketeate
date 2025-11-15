import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { customSession, emailOTP } from 'better-auth/plugins';
import { prisma } from '@repo/db';
import { Resend } from 'resend';

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is not set');
}

// Resend es opcional - solo se inicializa si la API key está configurada
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;


const formatFromEmail = (email: string): string => {

  if (email.includes('<') && email.includes('>')) {
    return email;
  }
 
  return `Ticketeate <${email}>`;
};


const RAW_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const FROM_EMAIL = formatFromEmail(RAW_FROM_EMAIL);


const sendEmail = async (options: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}) => {
  if (!resend) {
    const errorMsg = 'RESEND_API_KEY is not set. Email functionality is disabled.';
    console.error('[Email]', errorMsg);
    console.error(
      '[Email] To enable email functionality, set RESEND_API_KEY in your .env.local file',
    );
    console.error('[Email] Get your API key from: https://resend.com/api-keys');
    throw new Error(errorMsg);
  }

  const { error } = await resend.emails.send(options);
  if (error) {
    console.error('[Email] Resend error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export const auth = betterAuth({
  url: process.env.BETTER_AUTH_URL,

  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, 
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      await sendEmail({
        from: FROM_EMAIL,
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
      await sendEmail({
        from: FROM_EMAIL,
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

  // Configuración de Google OAuth (opcional)
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),

  plugins: [
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
          await sendEmail({
            from: FROM_EMAIL,
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
        } catch (error) {
          console.error('[OTP] Failed to send email:', error);
          throw error;
        }
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutos
      sendVerificationOnSignUp: false, // No enviar OTP automáticamente al registrarse
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

  onPasswordReset: async ({ user }: { user: any }) => {
    // Cerrar todas las sesiones del usuario después de restablecer la contraseña
    if (user?.id) {
      try {
        // Eliminar todas las sesiones activas del usuario
        await prisma.session.deleteMany({
          where: {
            userId: user.id,
          },
        });
      } catch (error) {
        console.error('[Security] Error revoking sessions after password reset:', error);
      }
    }
  },

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
