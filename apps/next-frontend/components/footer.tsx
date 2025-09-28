import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-orange-600 text-white py-9 mt-12">
      <div className="container mx-auto px-4 text-center">
        <h1>&copy; 2025 Ticketeate. Todos los derechos reservados.</h1>
        <Link
          href="/sobre-nosotros"
          className="text-center font-medium text-white hover:text-gray-300 "
        >
          Sobre nosotros
        </Link>
        {/* Redes sociales */}
        <div className="flex items-center justify-center space-x-6 mt-6">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition"
          >
            <Instagram size={28} />
          </a>
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition"
          >
            <Facebook size={28} />
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition"
          >
            <Twitter size={28} />
          </a>
        </div>
      </div>
    </footer>
  );
};
