'use client';
import { ArrowUpRight, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="https://ease-one.vercel.app/bg/something.mp4"
        className="absolute inset-0 h-full w-full object-cover"
      />
      
      {/* Overlay con gradiente sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
      
      {/* Contenido principal */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Badge de destacado */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm border border-orange-400/30"
            >
              <Play className="h-4 w-4" />
              ¡Nuevo! Bad Bunny en vivo
            </motion.div>

            {/* Título principal */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Eventos sin{' '}
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                límites
              </span>
              , infraestructura sin complicaciones
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mx-auto max-w-2xl text-lg text-gray-200 sm:text-xl"
            >
              Crea, gestiona y vende entradas en minutos con Ticketeate. 
              La plataforma más completa para la gestión de eventos.
            </motion.p>

            {/* Botones de acción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/crear"
                className="group inline-flex items-center gap-2 rounded-full bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-orange-700 hover:scale-105 hover:shadow-xl"
              >
                Crear tu primer evento
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
              
              <Link
                href="/eventos"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105"
              >
                Explorar eventos
              </Link>
            </motion.div>

            {/* Estadísticas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="grid grid-cols-3 gap-8 pt-8"
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
