'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HoveredLink, Menu, MenuItem, ProductItem } from '@/components/ui/navbar-menu';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/auth-client';
import { Search, SearchIcon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSearch } from '@/contexts/search-context';

export function NewNavbar() {
  return <Navbar />;
}

function Navbar() {
  const [active, setActive] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session;
  const isLoading = isPending;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Si estamos en la home, no redirigir, solo filtrar
    if (pathname === '/') {
      return;
    }
    // Si estamos en otra página, redirigir a home o descubrir
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-gray-600/30' : 'bg-black',
      )}
    >
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex-shrink-0 mr-4 lg:mr-6">
            <Image
              src="/wordmark-light.png"
              alt="Ticketeate"
              width={180}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Barra de búsqueda expandida */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center flex-1 max-w-md mr-6"
          >
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="peer h-10 w-full rounded-lg border border-zinc-600 bg-white/10 backdrop-blur-sm px-10 text-sm text-zinc-200 placeholder:text-zinc-400 hover:border-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon className="h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </form>

          {/* Navigation Menu */}
          <div className="flex-1 flex justify-center">
            <Menu setActive={setActive}>
              <MenuItem setActive={setActive} active={active} item="Descubrir">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="/descubrir">Eventos</HoveredLink>
                  <HoveredLink href="/productoras">Productoras</HoveredLink>
                </div>
              </MenuItem>

              <MenuItem setActive={setActive} active={active} item="Equipo">
                <div className="text-sm grid grid-cols-2 gap-6 p-2">
                  <ProductItem
                    title="Blog"
                    href="/blog"
                    src="/graphqr-ticketeate.png"
                    description="Artículos y noticias sobre eventos"
                  />
                  <ProductItem
                    title="Cómo trabajamos"
                    href="/como-trabajamos"
                    src="/graphqr-ticketeate.png"
                    description="Nuestro proceso y metodología"
                  />
                  <ProductItem
                    title="Nuestros valores"
                    href="/valores"
                    src="/graphqr-ticketeate.png"
                    description="Los principios que nos guían"
                  />
                  <ProductItem
                    title="Personas"
                    href="/personas"
                    src="/graphqr-ticketeate.png"
                    description="Conoce al equipo de Ticketeate"
                  />
                </div>
              </MenuItem>

              <MenuItem setActive={setActive} active={active} item="Recursos">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="/como-empezar">Cómo empezar</HoveredLink>
                  <HoveredLink href="/contacto">Contacto</HoveredLink>
                  <HoveredLink href="/estado">Estado</HoveredLink>
                  <HoveredLink href="/marca">Marca</HoveredLink>
                </div>
              </MenuItem>
            </Menu>

            <Link
              href="/precios"
              className="px-6 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors duration-200"
            >
              Precio
            </Link>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0 ml-2 lg:ml-8">
            {/* Botón de búsqueda móvil */}
            <button
              onClick={() => router.push('/descubrir')}
              className="lg:hidden p-2 text-zinc-300 hover:text-white transition-colors duration-200"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>

            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-24 h-9 bg-stone-800 rounded-md animate-pulse"></div>
              </div>
            ) : (
              <>
                {isAuthenticated ? (
                  <Link
                    href="/eventos"
                    className="px-3 lg:px-4 py-2 text-sm font-medium rounded-md text-stone-300 hover:text-white transition-colors duration-200"
                  >
                    Mi Panel
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="px-3 lg:px-4 py-2 text-sm font-medium rounded-md text-stone-300 hover:text-white transition-colors duration-200"
                  >
                    Acceso
                  </Link>
                )}
              </>
            )}
            <Link
              href="/crear"
              className="px-4 lg:px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md transition-colors duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
            >
              Crear Evento
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
