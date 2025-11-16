import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Role = 'USUARIO' | 'ORGANIZADOR' | 'COLABORADOR';

export function useRoleProtection(allowedRoles: Role[], redirectTo: string = '/') {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // No hacer nada mientras se carga la sesión
    if (isPending) return;

    // Si no hay sesión, redirigir
    if (!session) {
      router.push(redirectTo);
      return;
    }

    // Si la sesión existe pero el rol no está permitido, redirigir
    const userRole = (session.user as any)?.role as Role | undefined;
    if (userRole && !allowedRoles.includes(userRole)) {
      router.push(redirectTo);
    }
  }, [session, isPending, allowedRoles, redirectTo, router]);

  return {
    isProtected: !isPending && session && allowedRoles.includes((session.user as any)?.role),
    isLoading: isPending,
  };
}
