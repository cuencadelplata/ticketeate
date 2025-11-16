import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { SimplifiedAdminDashboard } from '@/components/deploys/simplified-admin-dashboard';

// Definir los emails autorizados para acceder a esta ruta (variable privada del servidor)
const AUTHORIZED_EMAILS = (process.env.DEPLOYS_AUTHORIZED_EMAILS || '').split(',').filter(Boolean);

export default async function DeploysPage() {
  // Verificar sesión en el servidor
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Si no hay sesión, redirigir al login
  if (!session) {
    redirect('/auth');
  }

  // Verificar si el email del usuario está autorizado
  const userEmail = session.user.email;
  if (!AUTHORIZED_EMAILS.includes(userEmail)) {
    redirect('/unauthorized');
  }

  return <SimplifiedAdminDashboard />;
}
