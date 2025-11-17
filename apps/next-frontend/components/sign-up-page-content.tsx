'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { roleToPath } from '@/lib/role-redirect';
import AuthPage from '@/components/auth-page';

type Role = 'USUARIO' | 'ORGANIZADOR' | 'COLABORADOR';

export function SignUpPageContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Limpiar timeout anterior si existe
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // No hacer nada mientras se carga la sesión
    if (isPending || isRedirecting) return;

    // Si hay sesión y está verificado, redirigir según el rol
    if (session) {
      const user = session.user as any;
      const emailVerified = user?.emailVerified;

      if (emailVerified) {
        const userRole = user?.role as Role | undefined;
        const target = roleToPath(userRole);

        console.log('[SignUpPageContent] Redirigiendo:', { target, userRole, emailVerified });

        setIsRedirecting(true);

        // Usar replace en lugar de push para evitar que vuelva a esta página
        redirectTimeoutRef.current = setTimeout(() => {
          router.replace(target);
        }, 100);
        return;
      }
    }
  }, [session, isPending, isRedirecting, router]);

  // Si está cargando la sesión o redirigiendo, mostrar spinner
  if (isPending || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-orange-500" />
      </div>
    );
  }

  // Si hay sesión y está verificado, no mostrar nada (debería haber redirigido)
  if (session && (session.user as any)?.emailVerified) {
    return null;
  }

  // Si no hay sesión o no está verificado, mostrar formulario con detección automática
  // defaultTab y defaultRole se omiten para permitir detección automática
  return <AuthPage />;
}
