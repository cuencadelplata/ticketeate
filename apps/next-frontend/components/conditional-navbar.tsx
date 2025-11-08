'use client';
import { usePathname } from 'next/navigation';
import { NewNavbar } from './new-navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();

  // No mostrar navbar en rutas de autenticación y crear evento
  if (pathname === '/crear' || pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/deploys') {
    return null;
  }

  // No mostrar navbar en rutas dinámicas de evento, excepto /evento/manage/[id]
  if (pathname.startsWith('/evento/') && !pathname.startsWith('/evento/manage/')) {
    return null;
  }

  return <NewNavbar />;
}
