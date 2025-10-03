'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HoveredLink, Menu, MenuItem, ProductItem } from '@/components/ui/navbar-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export function NewNavbar() {
  return <Navbar />;
}

function Navbar() {
  const [active, setActive] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isSignedIn, isLoading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-gray-600/30' : 'bg-black',
      )}
    >
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex items-center justify-between">
          {/* Ticketeate Wordmark */}
          <Link href="/" className="flex-shrink-0 mr-20">
            <Image
              src="/wordmark-light.png"
              alt="Ticketeate"
              width={180}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Navigation Menu */}
          <div className="flex-1 flex justify-center">
            <Menu setActive={setActive}>
              <MenuItem setActive={setActive} active={active} item="Descubrir">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="/eventos">Eventos</HoveredLink>
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

            {/* Precio as simple button */}
            <Link
              href="/precios"
              className="px-6 py-2 text-sm font-medium text-white hover:text-gray-300 transition-colors duration-200"
            >
              Precio
            </Link>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0 ml-8">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-20 h-9 bg-stone-800 rounded-full animate-pulse"></div>
                <div className="w-24 h-9 bg-stone-800 rounded-full animate-pulse"></div>
              </div>
            ) : (
              <>
                {isSignedIn ? (
                  <Link
                    href="/eventos"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Mi Panel
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Acceso
                  </Link>
                )}

                <Link
                  href="/crear"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-full transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Crear Evento
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
