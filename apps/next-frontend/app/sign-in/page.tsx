'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { roleToPath } from '@/lib/role-redirect';
import RoleAuthModal from '@/components/role-auth-modal';

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!isPending && session) {
      const role = (session as any).role as 'ORGANIZADOR' | 'USUARIO' | 'COLABORADOR' | undefined;
      router.replace(roleToPath(role));
    }
  }, [isPending, session, router]);

  const handleClose = () => {
    setOpen(false);
    router.replace('/');
  };

  return <RoleAuthModal open={open} onClose={handleClose} defaultTab="login" defaultRole="USUARIO" />;
}
