'use client';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PixelBlast from './pixel-blast';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-10">
      {/* PixelBlast como fondo de pantalla completa */}
      <div className="absolute inset-0 z-0 bg-black overflow-hidden">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#c9400e"
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

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-16 w-full relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Contenido de texto y botones centrado */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8 max-w-4xl"
          >
            {/* Título principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl font-normal tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-7xl font-instrument-serif"
            >
              Eventos sin{' '}
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent italic inline-block px-1 font-instrument-serif">
                límites
              </span>
              ,
              <br />
              gestión sin{' '}
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent italic inline-block px-1 font-instrument-serif">
                complicaciones
              </span>
              .
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-md text-gray-200 sm:text-lg max-w-2xl mx-auto"
            >
              Crea, gestiona y vende entradas en minutos con{' '}
              <span className="text-white">Ticketeate</span>.
            </motion.p>

            {/* Botones de acción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/crear"
                className="group inline-flex items-center justify-center gap-2 rounded-md bg-orange-600 px-3 py-2 text-base text-white shadow-lg transition-all duration-300 hover:bg-orange-700 "
              >
                Crear tu primer evento
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>

              <Link
                href="/descubrir"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm text-white backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/20"
              >
                Descubrir eventos
              </Link>
            </motion.div>

            {/* Estadísticas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="grid grid-cols-3 gap-8 pt-8 max-w-md mx-auto"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white sm:text-3xl">500+</div>
                <div className="text-sm text-gray-300">Eventos creados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white sm:text-3xl">50K+</div>
                <div className="text-sm text-gray-300">Entradas vendidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white sm:text-3xl">98%</div>
                <div className="text-sm text-gray-300">Satisfacción</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
