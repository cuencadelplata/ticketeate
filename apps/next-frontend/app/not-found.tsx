'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Home, Calendar, Search } from 'lucide-react';
import PixelBlast from '@/components/pixel-blast';

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center pt-16">
      {/* PixelBlast background */}
      <div className="absolute inset-0 z-0 bg-black overflow-hidden">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#692106"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent={false}
          className="!w-full !h-full"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* 404 Number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-7xl sm:text-8xl md:text-9xl text-white font-instrument-serif">
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                404
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-3xl sm:text-4xl text-white font-instrument-serif">
              ¡Oops! Página no encontrada
            </h2>
            <p className="text-lg text-stone-200 max-w-2xl mx-auto">
              Parece que esta página se marchó de fiesta sin avisar. Pero no te preocupes, tenemos
              muchos eventos increíbles esperándote.
            </p>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
          >
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-orange-600 px-3 py-2 text-md text-white shadow-lg transition-all duration-300 hover:bg-orange-700 hover:shadow-xl"
            >
              <Home className="h-5 w-5" />
              Volver al inicio
              <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>

            <Link
              href="/descubrir"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-2 text-md text-white backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/20 hover:shadow-xl"
            >
              <Calendar className="h-5 w-5" />
              Descubrir más eventos
            </Link>
          </motion.div>

          {/* Additional help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="pt-8 space-y-4"
          >
            <p className="text-stone-300 text-sm">
              También puedes explorar nuestras otras secciones:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/crear"
                className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors duration-300"
              >
                <Calendar className="h-4 w-4" />
                <span>Crear evento</span>
              </Link>
              <Link
                href="/blog"
                className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors duration-300"
              >
                <Search className="h-4 w-4" />
                <span>Blog</span>
              </Link>
              <Link
                href="/sobre-nosotros"
                className="flex items-center gap-2 text-stone-300 hover:text-white transition-colors duration-300"
              >
                <Home className="h-4 w-4" />
                <span>Sobre nosotros</span>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
