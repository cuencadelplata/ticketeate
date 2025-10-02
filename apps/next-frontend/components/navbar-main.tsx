'use client';
import Link from 'next/link';
import Image from 'next/image';
import DarkMode from './DarkMode';
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs';
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-700/20">
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Logo + links */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <Image
                src="/wordmark-light.png"
                alt="Ticketeate"
                width={140}
                height={40}
                priority
                className="transition-transform duration-300 group-hover:scale-105 object-contain"
              />
            </div>
          </Link>

          <nav className="hidden space-x-8 pl-12 md:flex">
            <Link
              href="/eventos"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 relative group"
            >
              Mis Eventos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 dark:bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/productoras"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 relative group"
            >
              Productoras
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 dark:bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/sobre-nosotros"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-300 relative group"
            >
              Sobre Nosotros
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-600 dark:bg-orange-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
        </div>

        {/* Buscador + sesión */}
        <div className="flex items-center space-x-4">
          {/* Barra de búsqueda */}
          <form onSubmit={onSubmit} className="relative hidden lg:flex">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="search"
              aria-label="Buscar por artista o eventos"
              placeholder="Buscar eventos..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="h-10 w-80 pl-10 pr-20 rounded-full text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            />
            {term && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-16 top-1.5 rounded-full px-2 h-7 text-xs font-medium bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 top-1 rounded-full px-3 h-8 text-xs font-medium bg-orange-600 text-white hover:bg-orange-700 transition-all duration-300 hover:scale-105"
            >
              Buscar
            </button>
          </form>

          {/* Darkmode */}
          <DarkMode />

          {/* Clerk */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-full bg-orange-600 px-4 py-2 hover:bg-orange-700 text-white transition-all duration-300 hover:scale-105 shadow-lg">
                Iniciar sesión
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 border border-orange-600 dark:border-orange-400 ml-2 transition-all duration-300 hover:scale-105 shadow-lg">
                Registrarse
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export { NavbarHome };
export default NavbarHome;
