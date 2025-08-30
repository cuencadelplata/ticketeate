'use client';
import Link from 'next/link';
import { Search, Bell } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@heroui/react';
import UserNav from './usernav';

export function Navbar() {
  const isAuthenticated = true;

  return (
    <div className="flex h-14 items-center justify-between bg-transparent px-6">
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/wordmark-light.png" alt="Picture of the author" width={130} height={40} />
        </Link>

        <div className="hidden space-x-6 pl-12 md:flex">
          {isAuthenticated ? (
            <>
              <Link href="/eventos" className="text-sm font-medium text-zinc-200 hover:text-white">
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
              <Link href="/crear" className="text-sm font-medium text-zinc-200 hover:text-white">
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
          className="rounded-full text-zinc-200 hover:text-white"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          className="rounded-full text-zinc-200 hover:text-white"
        >
          <Bell className="h-4 w-4" />
        </Button>

        <div className="px-2">
          <UserNav />
        </div>
      </div>
    </div>
  );
}
