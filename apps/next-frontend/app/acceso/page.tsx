import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { roleToPath, type AppRole } from '@/lib/role-redirect';

export default async function AccessPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Si tiene sesión verificada, redirigir a su dashboard
  if (session?.user?.emailVerified) {
    const target = roleToPath(session.user.role as AppRole | undefined);
    redirect(target);
  }

  // Si tiene sesión sin verificar (OTP pendiente), ir a registro
  if (session?.user && !session.user.emailVerified) {
    redirect('/acceso/register');
  }

  // Sin sesión, ir a login
  redirect('/acceso/login');
}
