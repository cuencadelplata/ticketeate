'use client';
import { usePathname } from 'next/navigation';
import { NewNavbar } from './new-navbar';

export function ConditionalNavbar() {
  const pathname = usePathname();

  // No mostrar navbar en la ruta /crear
  if (pathname === '/crear') {
    return null;
  }

  return <NewNavbar />;
}
