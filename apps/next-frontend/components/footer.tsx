'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Circle } from 'lucide-react';

const SystemStatus = () => {
  const [isSystemUp] = useState(true);

  return (
    <button
      onClick={() => {}}
      className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-200 ${
        isSystemUp
          ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
          : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
      }`}
    >
      <Circle
        className={`h-2 w-2 ${isSystemUp ? 'text-green-400' : 'text-red-400'}`}
        fill="currentColor"
      />
      <span className="text-xs font-medium">Todos los sistemas operativos</span>
    </button>
  );
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-white relative z-[100]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Contenido principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Columna 1: Brand y estado */}
          <div className="space-y-6">
            <div className="flex items-center space-x-1">
              <Image src="/wordmark-light-alt.png" alt="Ticketeate" width={130} height={35} />
            </div>
            <p className="text-stone-300 text-sm leading-relaxed">
              La plataforma más completa para crear tus eventos, gestionar y vender entradas.
            </p>

            {/* System Status */}
            <SystemStatus />
          </div>

          {/* Columna 2: Enlaces esenciales */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Enlaces principales */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Descubrir</h4>
                <nav className="space-y-2">
                  <Link
                    href="/eventos"
                    className="block text-stone-300 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    Eventos
                  </Link>
                  <Link
                    href="/productoras"
                    className="block text-stone-300 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    Productoras
                  </Link>
                  <Link
                    href="/crear"
                    className="block text-orange-400 hover:text-orange-300 transition-colors duration-200 text-sm font-medium"
                  >
                    Crear Evento
                  </Link>
                </nav>
              </div>

              {/* Soporte */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white">Recursor</h4>
                <nav className="space-y-2">
                  <Link
                    href="/como-empezar"
                    className="block text-stone-300 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    Cómo empezar
                  </Link>
                  <Link
                    href="/contacto"
                    className="block text-stone-300 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    Contacto
                  </Link>
                  <Link
                    href="/precios"
                    className="block text-stone-300 hover:text-orange-400 transition-colors duration-200 text-sm"
                  >
                    Precios
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-stone-800 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-stone-400">
              <span>Hecho con</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>en Argentina</span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-stone-400">
              <span>&copy; {currentYear} Ticketeate</span>
              <div className="flex space-x-4">
                <Link
                  href="/privacy"
                  className="hover:text-orange-400 transition-colors duration-200"
                >
                  Privacidad
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-orange-400 transition-colors duration-200"
                >
                  Términos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
