'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { roleToPath } from '@/lib/role-redirect';
import AuthModal from '@/components/auth-modal';

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && session) {
      const role = (session as any).role as 'ADMIN' | 'ORGANIZADOR' | 'USUARIO' | undefined;
      router.replace(roleToPath(role));
    }
  }, [isPending, session, router]);

  const handleClose = () => {
    setOpen(false);
    router.replace('/');
  };

  return <AuthModal open={open} onClose={handleClose} defaultTab="login" />;
}
