'use client';

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface OrganizerGuardProps {
  children: React.ReactNode;
}

/**
 * Guard component que controla acceso a rutas de organizador
 * Permite: No autenticados (para que se registren), ORGANIZADOR, PRODUCER
 * Bloquea: USUARIO, COLABORADOR
 */
export function OrganizerGuard({ children }: OrganizerGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const userRole = (session?.user as any)?.role;
  // Autorizado si: no hay sesión (usuario anónimo) O es ORGANIZADOR/PRODUCER
  // No autorizado si: es USUARIO o COLABORADOR
  const isAuthorized = !session || userRole === 'ORGANIZADOR' || userRole === 'PRODUCER';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Solo ejecutar después de que el componente esté montado y la sesión se haya cargado
    if (!isMounted || isPending) return;

    // Si es USUARIO o COLABORADOR, redirigir a home
    if (session?.user && (userRole === 'USUARIO' || userRole === 'COLABORADOR')) {
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
