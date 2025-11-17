'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { NavbarHome } from '@/components/navbar-main';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  Ticket,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const steps = [
  {
    icon: Users,
    title: 'Crea tu cuenta',
    description:
      'Regístrate en Ticketeate en solo 2 minutos. Elige tu rol como organizador o fan de eventos.',
  },
  {
    icon: Ticket,
    title: 'Configura tu evento',
    description:
      'Agrega detalles del evento, fechas, ubicación, precio de entradas y límite de capacidad.',
  },
  {
    icon: Settings,
    title: 'Personaliza tus tickets',
    description:
      'Define tipos de entradas, precios diferenciales y beneficios especiales para cada categoría.',
  },
  {
    icon: CreditCard,
    title: 'Activa pagos',
    description:
      'Conecta tu cuenta bancaria o billetera digital para recibir pagos de manera segura.',
  },
  {
    icon: BarChart3,
    title: 'Promociona tu evento',
    description:
      'Usa nuestras herramientas de marketing para llegar a más personas y vender más entradas.',
  },
  {
    icon: Zap,
    title: 'Sé live',
    description: 'Publica tu evento y comienza a vender. Monitorea las ventas en tiempo real.',
  },
];

const features = [
  {
    title: 'Seguridad garantizada',
    description: 'Todos los pagos están protegidos y encriptados',
    icon: Shield,
  },
  {
    title: 'Soporte 24/7',
    description: 'Nuestro equipo está disponible para ayudarte',
    icon: Users,
  },
  {
    title: 'Cero comisiones',
    description: 'Mantén el 100% de tus ganancias de tickets',
    icon: CreditCard,
  },
  {
    title: 'Herramientas potentes',
    description: 'Analytics, reportes y estadísticas en tiempo real',
    icon: BarChart3,
  },
];

export default function ComoEmpezarPage() {
  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Navbar */}
      <Suspense fallback={<div className="h-16" />}>
        <NavbarHome />
      </Suspense>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 bg-gradient-to-br from-orange-50 via-stone-50 to-white dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 dark:text-white mb-4 sm:mb-6">
              Cómo <span className="text-orange-500 dark:text-orange-400">Empezar</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto leading-relaxed px-4">
              Sigue estos 6 sencillos pasos para crear tu primer evento y comenzar a vender entradas
              en Ticketeate.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white dark:bg-stone-800">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-stone-50 dark:bg-stone-700 border-stone-200 dark:border-stone-600 hover:shadow-lg transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-400">
                    <CardContent className="p-6 sm:p-8">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-orange-500 dark:bg-orange-600">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-semibold text-stone-900 dark:text-white mb-2">
                            {index + 1}. {step.title}
                          </h3>
                          <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-orange-50 to-stone-50 dark:from-stone-900 dark:to-stone-800">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-4">
              ¿Por qué elegir{' '}
              <span className="text-orange-500 dark:text-orange-400">Ticketeate</span>?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-300">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white dark:bg-stone-800">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-4 sm:mb-6">
              ¿Listo para empezar?
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-300 mb-8">
              Crea tu cuenta ahora y publica tu primer evento en minutos
            </p>
            <Link
              href="/crear"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Crear mi primer evento
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Suspense fallback={<div className="h-20" />}>
        <Footer />
      </Suspense>
    </main>
  );
}
