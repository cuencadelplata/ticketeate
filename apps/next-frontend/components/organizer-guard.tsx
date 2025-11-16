'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface OrganizerGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component that ensures only ORGANIZADOR (and COLABORADOR/PRODUCER) roles can access the content
 * Redirects USUARIO role to home page
 */
export function OrganizerGuard({ children }: OrganizerGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const userRole = (session?.user as any)?.role;
  const isAuthorized =
    userRole === 'ORGANIZADOR' || userRole === 'COLABORADOR' || userRole === 'PRODUCER';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Solo ejecutar después de que el componente esté montado y la sesión se haya cargado
    if (!isMounted || isPending) return;

    // Si no hay sesión, redirigir a home
    if (!session?.user) {
      router.push('/');
      return;
    }

    // Si es USUARIO, redirigir a home
    if (userRole === 'USUARIO') {
      router.push('/');
      return;
    }
  }, [isMounted, isPending, session, userRole, router]);

  // Mientras carga, mostrar spinner
  if (isPending || !isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Si no está autorizado, no mostrar nada (el useEffect redirigirá)
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
