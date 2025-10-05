'use client';
import * as React from 'react';
import { useSession } from '@/lib/auth-client';
import AuthModal from '@/components/auth-modal';
import CreateEventForm from '@/components/create-event-form';

export default function CrearPage() {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isPending && !session) {
      const t = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(t);
    }
  }, [isPending, session]);

  return (
    <>
      <CreateEventForm />
      <AuthModal open={open} onClose={() => setOpen(false)} defaultTab="login" />
    </>
  );
}
