'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HoveredLink, Menu, MenuItem, ProductItem } from '@/components/ui/navbar-menu';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/auth-client';
import { SearchIcon, MenuIcon, X, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSearch } from '@/contexts/search-context';
import { motion, AnimatePresence } from 'framer-motion';

export function NewNavbar() {
  return <Navbar />;
}

function Navbar() {
  const [active, setActive] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);
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

  // Cerrar menú mobile al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setExpandedMobileSection(null);
  }, [pathname]);

  // Bloquear scroll cuando el menú mobile está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

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

  const toggleMobileSection = (section: string) => {
    setExpandedMobileSection(expandedMobileSection === section ? null : section);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-stone-600/30' : 'bg-black',
      )}
    >
      <div className="max-w-7xl mx-auto px-3 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 mr-2 md:mr-4 lg:mr-6 z-50">
            <Image
              src="/wordmark-light-alt.png"
              alt="Ticketeate"
              width={180}
              height={40}
              className="h-7 md:h-8 w-auto"
              priority
            />
          </Link>

          {/* Barra de búsqueda - Desktop */}
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

          {/* Menú Desktop */}
          <div className="hidden lg:flex flex-1 justify-center">
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

          {/* Botones de acción - Desktop y Mobile */}
          <div
            className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0 ml-2 lg:ml-8"
            suppressHydrationWarning
          >
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

          {/* Botón hamburguesa - Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-stone-300 transition-colors duration-200 z-50"
            aria-label="Toggle menu"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </motion.div>
          </button>
        </div>
      </div>

      {/* Menú Mobile con animación */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden fixed inset-0 top-[64px] bg-black/95 backdrop-blur-md z-40 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="max-w-7xl mx-auto px-4 py-6 space-y-6"
            >
              {/* Barra de búsqueda - Mobile */}
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                onSubmit={handleSearch}
                className="w-full"
              >
                <div className="relative w-full">
                  <input
                    type="search"
                    placeholder="Buscar eventos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 w-full rounded-lg border border-zinc-600 bg-white/10 backdrop-blur-sm px-12 text-base text-zinc-200 placeholder:text-zinc-400 hover:border-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <SearchIcon className="h-5 w-5 text-zinc-400" />
                  </div>
                </div>
              </motion.form>

              {/* Sección Descubrir */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="border-b border-zinc-800 pb-4"
              >
                <button
                  onClick={() => toggleMobileSection('descubrir')}
                  className="flex items-center justify-between w-full py-3 text-left text-white font-medium text-lg"
                >
                  Descubrir
                  <motion.div
                    animate={{ rotate: expandedMobileSection === 'descubrir' ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedMobileSection === 'descubrir' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-3 pl-4">
                        <Link
                          href="/descubrir"
                          className="block py-2 text-stone-300 hover:text-white transition-colors"
                        >
                          Eventos
                        </Link>
                        <Link
                          href="/productoras"
                          className="block py-2 text-stone-300 hover:text-white transition-colors"
                        >
                          Productoras
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Sección Equipo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="border-b border-zinc-800 pb-4"
              >
                <button
                  onClick={() => toggleMobileSection('equipo')}
                  className="flex items-center justify-between w-full py-3 text-left text-white font-medium text-lg"
                >
                  Equipo
                  <motion.div
                    animate={{ rotate: expandedMobileSection === 'equipo' ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedMobileSection === 'equipo' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-3 pl-4">
                        <Link
                          href="/blog"
                          className="block py-2 text-stone-300 hover:text-white transition-colors"
                        >
                          Blog
                        </Link>
                        <Link
                          href="/como-trabajamos"
                          className="block py-2 text-stone-300 hover:text-white transition-colors"
                        >
                          Cómo trabajamos
                        </Link>
                        <Link
                          href="/valores"
                          className="block py-2 text-stone-300 hover:text-white transition-colors"
                        >
                          Nuestros valores
                        </Link>
                        <Link
                          href="/personas"
                          className="block py-2 text-stone-300 hover:text-white transition-colors"
                        >
                          Personas
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Sección Recursos */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="border-b border-zinc-800 pb-4"
              >
                <button
                  onClick={() => toggleMobileSection('recursos')}
                  className="flex items-center justify-between w-full py-3 text-left text-white font-medium text-lg"
                >
                  Recursos
                  <motion.div
                    animate={{ rotate: expandedMobileSection === 'recursos' ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {expandedMobileSection === 'recursos' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-3 pl-4">
                        <Link
                          href="/como-empezar"
                          className="block py-2 text-stone-300 hover:text-white transition-colors"
                        >
                          Cómo empezar
                        </Link>
                        <Link
                          href="/contacto"
                          className="block py-2 text-stone-300 hover:text-white transition-colors"
                        >
                          Contacto
                        </Link>
                        <Link
                          href="/estado"
                          className="block py-2 text-stone-300 hover:text-white transition-colors"
                        >
                          Estado
                        </Link>
                        <Link
                          href="/marca"
                          className="block py-2 text-stone-300 hover:text-white transition-colors"
                        >
                          Marca
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Precios */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                <Link
                  href="/precios"
                  className="block py-3 text-white font-medium text-lg border-b border-zinc-800"
                >
                  Precio
                </Link>
              </motion.div>

              {/* Botones de acción - Mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="pt-4 space-y-3"
                suppressHydrationWarning
              >
                {isLoading ? (
                  <div className="w-full h-12 bg-stone-800 rounded-md animate-pulse"></div>
                ) : (
                  <>
                    {isAuthenticated ? (
                      <Link
                        href="/eventos"
                        className="block w-full px-4 py-3 text-center text-base font-medium rounded-md text-white bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200"
                      >
                        Mi Panel
                      </Link>
                    ) : (
                      <Link
                        href="/sign-in"
                        className="block w-full px-4 py-3 text-center text-base font-medium rounded-md text-white bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200"
                      >
                        Acceso
                      </Link>
                    )}
                  </>
                )}
                <Link
                  href="/crear"
                  className="block w-full px-4 py-3 text-center bg-orange-600 hover:bg-orange-700 text-white text-base font-medium rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Crear Evento
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
