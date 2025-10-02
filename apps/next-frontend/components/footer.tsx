import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import DarkMode from './DarkMode';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Contenido principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Columna 1: Información legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="flex items-center space-x-2">
              <Image
                src="/wordmark-light.png"
                alt="Ticketeate"
                width={120}
                height={35}
                className="filter brightness-0 invert object-contain"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              La plataforma más completa para crear, gestionar y vender entradas de eventos.
              Simplificamos la experiencia tanto para organizadores como para asistentes.
            </p>
            <div className="text-sm text-gray-400">
              <p>&copy; {currentYear} Ticketeate. Todos los derechos reservados.</p>
            </div>
          </motion.div>

          {/* Columna 2: Enlaces de navegación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-white">Enlaces</h3>
            <nav className="space-y-3">
              <Link
                href="/eventos"
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm"
              >
                Mis Eventos
              </Link>
              <Link
                href="/productoras"
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm"
              >
                Productoras
              </Link>
              <Link
                href="/sobre-nosotros"
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm"
              >
                Sobre Nosotros
              </Link>
              <Link
                href="/crear"
                className="block text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm"
              >
                Crear Evento
              </Link>
            </nav>
          </motion.div>

          {/* Columna 3: Contacto y redes sociales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-white">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <Mail className="h-4 w-4 text-orange-400" />
                <span>hola@ticketeate.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <Phone className="h-4 w-4 text-orange-400" />
                <span>+54 11 1234-5678</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 text-sm">
                <MapPin className="h-4 w-4 text-orange-400" />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>

            {/* Redes sociales y dark mode */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-white">Síguenos</h4>
              <div className="flex space-x-4 mb-4">
                <motion.a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full hover:bg-orange-600 transition-colors duration-300"
                >
                  <Instagram className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full hover:bg-orange-600 transition-colors duration-300"
                >
                  <Facebook className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 rounded-full hover:bg-orange-600 transition-colors duration-300"
                >
                  <Twitter className="h-5 w-5" />
                </motion.a>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Tema:</span>
                <DarkMode />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Hecho con</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>en Argentina</span>
            </div>
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-orange-400 transition-colors duration-300"
              >
                Política de Privacidad
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-orange-400 transition-colors duration-300"
              >
                Términos de Servicio
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-orange-400 transition-colors duration-300"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
