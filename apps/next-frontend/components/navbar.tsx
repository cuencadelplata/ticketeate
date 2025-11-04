'use client';
import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@heroui/react';
import { useSession } from '../lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';
import UserNav from './usernav';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session;
  const isLoading = isPending;

  const handleSignIn = (to?: string) => {
    const back = encodeURIComponent(to ?? pathname ?? '/');
    router.push(`/sign-in?redirect_url=${back}`);
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  // helpers para links protegidos con mejor UX:
  const goMisEventos = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      handleSignIn('/eventos');
    }
  };

  const goCrearEvento = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      handleSignIn('/crear');
    }
  };

  return (
    <div className="flex h-14 items-center justify-between bg-transparent px-6">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/wordmark-light.png" alt="Ticketeate" width={130} height={40} priority />
        </Link>

        <div className="hidden space-x-6 pl-12 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                href="/eventos"
                onClick={goMisEventos}
                className="text-sm font-medium text-zinc-200 hover:text-white"
              >
                Mis Eventos
              </Link>
              <Link
                href="/productoras"
                className="text-sm font-medium text-zinc-200 hover:text-white"
              >
                Productoras
              </Link>
              <Link
                href="/descubrir"
                className="text-sm font-medium text-zinc-200 hover:text-white"
              >
                Descubrir
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/descubrir"
                className="text-sm font-medium text-zinc-200 hover:text-white"
              >
                Descubrir
              </Link>
              <Link
                href="/crear"
                onClick={goCrearEvento}
                className="text-sm font-medium text-zinc-200 hover:text-white"
              >
                Crear Evento
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          aria-label="Buscar"
          className="rounded-full text-zinc-200 hover:text-white dark:text-zinc-300 dark:hover:text-white"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          aria-label="Notificaciones"
          className="rounded-full text-zinc-200 hover:text-white dark:text-zinc-300 dark:hover:text-white"
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* Auth actions */}
        <div className="px-2 flex items-center gap-3 justify-end">
          {isLoading ? (
            <div className="flex gap-2">
              <div className="h-6 w-24 animate-pulse rounded bg-zinc-700/50" />
              <div className="h-6 w-20 animate-pulse rounded bg-zinc-700/50" />
            </div>
          ) : isAuthenticated ? (
            <UserNav />
          ) : (
            <>
              <Button
                size="sm"
                className="rounded-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => handleSignIn()}
              >
                Iniciar sesión
              </Button>
              <Button
                size="sm"
                variant="bordered"
                className="rounded-full border-orange-500 text-orange-500 hover:bg-orange-500/10"
                onClick={handleSignUp}
              >
                Registrarse
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
