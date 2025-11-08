'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { NavbarHome } from '@/components/navbar-main';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/animated-counter';
import { Building2, MapPin, Calendar } from 'lucide-react';

type Producer = {
  slug: string;
  name: string;
  city: string;
  logo?: string;
  eventsCount?: number;
  description?: string;
};

const producers: Producer[] = [
  {
    slug: 'df-entertainment',
    name: 'DF Entertainment',
    city: 'Buenos Aires',
    eventsCount: 45,
    description: 'Especialistas en eventos corporativos y conciertos',
  },
  {
    slug: 'fenix',
    name: 'Fenix Entertainment',
    city: 'Buenos Aires',
    eventsCount: 32,
    description: 'Producción de eventos culturales y espectáculos',
  },
  {
    slug: 't4f',
    name: 'Time For Fun (T4F)',
    city: 'Buenos Aires',
    eventsCount: 128,
    description: 'Líder en entretenimiento y eventos masivos',
  },
  {
    slug: 'la-trastienda',
    name: 'La Trastienda',
    city: 'Buenos Aires',
    eventsCount: 67,
    description: 'Sala íntima para conciertos acústicos',
  },
];

export default function ProductorasPage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Navbar */}
      <Suspense fallback={<div className="h-16" />}>
        <NavbarHome />
      </Suspense>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Productoras <span className="text-orange-500 dark:text-orange-400">Argentinas</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Descubrí las mejores productoras de eventos de Argentina. Cada una con su estilo único
              y eventos increíbles para todos los gustos.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            <Card className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
              <CardContent className="p-0">
                <Building2 className="h-8 w-8 text-orange-500 dark:text-orange-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-500 dark:text-orange-400 mb-2">
                  <AnimatedCounter end={producers.length} />
                </div>
                <div className="text-gray-600 dark:text-gray-300">Productoras activas</div>
              </CardContent>
            </Card>
            <Card className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
              <CardContent className="p-0">
                <Calendar className="h-8 w-8 text-orange-500 dark:text-orange-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-500 dark:text-orange-400 mb-2">
                  <AnimatedCounter
                    end={producers.reduce((acc, p) => acc + (p.eventsCount || 0), 0)}
                  />
                </div>
                <div className="text-gray-600 dark:text-gray-300">Eventos disponibles</div>
              </CardContent>
            </Card>
            <Card className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
              <CardContent className="p-0">
                <MapPin className="h-8 w-8 text-orange-500 dark:text-orange-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-500 dark:text-orange-400 mb-2">
                  <AnimatedCounter end={1} />
                </div>
                <div className="text-gray-600 dark:text-gray-300">Ciudad principal</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Productoras Grid */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {producers.map((producer, index) => (
              <motion.div
                key={producer.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 h-full">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-4">
                        <Building2 className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {producer.name}
                        </h3>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{producer.city}, Argentina</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                      {producer.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{producer.eventsCount} eventos</span>
                      </div>
                    </div>

                    <Link
                      href={`/productoras/${producer.slug}`}
                      className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      Ver eventos
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-white mb-6">¿Eres una productora?</h2>
            <p className="text-xl text-orange-100 mb-8">
              Únete a nuestra plataforma y llega a miles de personas interesadas en tus eventos.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/crear"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-orange-600 font-semibold rounded-full hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Crear mi primer evento
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
