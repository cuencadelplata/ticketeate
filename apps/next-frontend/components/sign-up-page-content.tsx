'use client';

import { useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { roleToPath } from '@/lib/role-redirect';
import AuthPage from '@/components/auth-page';

type Role = 'USUARIO' | 'ORGANIZADOR' | 'COLABORADOR';

export function SignUpPageContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // No hacer nada mientras se carga la sesión
    if (isPending) return;

    // Si hay sesión y está verificado, redirigir según el rol
    if (session) {
      const user = session.user as any;
      const emailVerified = user?.emailVerified;

      if (emailVerified) {
        const userRole = user?.role as Role | undefined;
        const target = roleToPath(userRole);
        router.push(target);
      }
    }
  }, [session, isPending, router]);

  // Si está cargando la sesión, mostrar spinner
  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // Si hay sesión y está verificado, no mostrar nada (el useEffect redirigirá)
  if (session && (session.user as any)?.emailVerified) {
    return null;
  }

  // Si no hay sesión o no está verificado, mostrar formulario de registro
  return <AuthPage defaultTab="register" defaultRole="USUARIO" />;
}
