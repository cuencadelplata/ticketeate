'use client';
import Link from 'next/link';
import Image from 'next/image';
import DarkMode from './DarkMode';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

function NavbarHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState('');

  // sincroniza input con ?search de la URL
  useEffect(() => {
    setTerm(searchParams.get('search') ?? '');
  }, [searchParams]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    router.push(q ? `/?search=${encodeURIComponent(q)}` : '/');
  };

  const clearSearch = () => {
    setTerm('');
    router.push('/');
  };

  return (
    <div className="flex h-14 items-center justify-between bg-transparent px-6 z-10">
      {/* Logo + links */}
      <div className="flex items-center space-x-8">
        <Link href="/" className="flex items-center space-x-2 bg-orange-500 p-2 rounded-full">
          <Image src="/wordmark-light.png" alt="Ticketeate" width={130} height={40} priority />
        </Link>

        <div className="hidden space-x-6 pl-12 md:flex">
          <Link
            href="/eventos"
            className="text-sm font-medium text-white hover:text-orange-100  bg-orange-500 p-2 rounded-full"
          >
            Mis Eventos
          </Link>
          <Link
            href="/productoras"
            className="text-sm font-medium text-white hover:text-orange-100 bg-orange-500 p-2 rounded-full"
          >
            Productoras
          </Link>
        </div>
      </div>

      {/* Buscador + sesión */}
      <div className="flex items-center space-x-6">
        {/* Barra de búsqueda */}
        <form onSubmit={onSubmit} className="relative hidden md:flex">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            aria-label="Buscar por artista o eventos"
            placeholder="Buscar por artista o eventos"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="h-9 w-96 pl-10 pr-24 rounded-full text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {term && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-14 top-1 rounded-full px-3 h-7 text-xs font-medium bg-gray-400 text-white hover:bg-gray-500"
            >
              Limpiar
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1 top-1 rounded-full px-3 h-7 text-xs font-medium bg-orange-600 text-white hover:bg-orange-700"
          >
            Buscar
          </button>
        </form>

        {/* Darkmode */}
        <div>
          <DarkMode />
        </div>

        {/* Clerk */}
        <SignedOut>
          <button className="rounded-full bg-orange-600 px-4 py-2 hover:bg-orange-700 text-white">
            Iniciar sesión
          </button>
          <button className="rounded-full bg-orange-700 px-4 py-2 hover:bg-orange-700 text-white">
            Registrarse
          </button>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </div>
  );
}

export { NavbarHome };
export default NavbarHome;
