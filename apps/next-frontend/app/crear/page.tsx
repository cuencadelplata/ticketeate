'use client';
import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import AuthModal from '@/components/auth-modal';
import CreateEventForm from '@/components/create-event-form';

export default function CrearPage() {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      // Mostrar el modal después de 1 segundo si no hay sesión
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    } else if (session) {
      // Si ya hay sesión, cerrar el modal
      setOpen(false);
    }
  }, [isPending, session]);

  return (
    <>
      <CreateEventForm />
      <AuthModal
        open={open}
        onClose={() => setOpen(false)}
        defaultTab="register"
        defaultRole="ORGANIZADOR"
      />
    </>
  );
}
