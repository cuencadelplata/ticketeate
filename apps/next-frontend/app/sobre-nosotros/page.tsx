'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { NavbarHome } from '@/components/navbar-main';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '@/components/animated-counter';
import {
  Users,
  Target,
  Heart,
  Award,
  Globe,
  Calendar,
  Ticket,
  Star,
  CheckCircle,
} from 'lucide-react';

export default function SobreNosotrosPage() {
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
              Sobre <span className="text-orange-500 dark:text-orange-400">Ticketeate</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Somos la plataforma líder en Argentina para la venta de entradas de eventos.
              Conectamos a productoras, artistas y fans para crear experiencias inolvidables.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
          >
            <Card className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-orange-500 dark:text-orange-400 mb-2">
                  <AnimatedCounter end={50000} suffix="+" />
                </div>
                <div className="text-gray-600 dark:text-gray-300">Entradas vendidas</div>
              </CardContent>
            </Card>
            <Card className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-orange-500 dark:text-orange-400 mb-2">
                  <AnimatedCounter end={200} suffix="+" />
                </div>
                <div className="text-gray-600 dark:text-gray-300">Eventos realizados</div>
              </CardContent>
            </Card>
            <Card className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-orange-500 dark:text-orange-400 mb-2">
                  <AnimatedCounter end={15000} suffix="+" />
                </div>
                <div className="text-gray-600 dark:text-gray-300">Usuarios activos</div>
              </CardContent>
            </Card>
            <Card className="text-center p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
              <CardContent className="p-0">
                <div className="text-4xl font-bold text-orange-500 dark:text-orange-400 mb-2">
                  <AnimatedCounter end={98} suffix="%" />
                </div>
                <div className="text-gray-600 dark:text-gray-300">Satisfacción</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
          >
            <Card className="p-8 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white dark:bg-gray-800">
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-orange-500 dark:text-orange-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nuestra Misión</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Democratizar el acceso a eventos culturales y de entretenimiento en Argentina,
                facilitando la conexión entre productoras, artistas y el público, mientras
                garantizamos una experiencia de compra segura, rápida y confiable.
              </p>
            </Card>

            <Card className="p-8 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white dark:bg-gray-800">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-orange-500 dark:text-orange-400 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nuestra Visión</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Ser la plataforma de referencia en Latinoamérica para la venta de entradas,
                expandiendo nuestro alcance y conectando a más personas con las experiencias
                culturales que aman, impulsando la industria del entretenimiento.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            Nuestros Valores
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <Card className="p-6 text-center bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
              <Heart className="h-12 w-12 text-orange-500 dark:text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Pasión</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Amamos lo que hacemos y creemos en el poder transformador de los eventos culturales.
              </p>
            </Card>

            <Card className="p-6 text-center bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
              <Award className="h-12 w-12 text-orange-500 dark:text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Excelencia
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Nos esforzamos por ofrecer la mejor experiencia posible en cada interacción.
              </p>
            </Card>

            <Card className="p-6 text-center bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
              <Users className="h-12 w-12 text-orange-500 dark:text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Comunidad
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Construimos puentes entre artistas, productoras y fans para crear conexiones
                duraderas.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            ¿Qué Ofrecemos?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-orange-500 dark:border-orange-400 border-0">
              <Ticket className="h-8 w-8 text-orange-500 dark:text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Venta de Entradas
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Sistema seguro y confiable para la compra de entradas con múltiples métodos de pago.
              </p>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-orange-500 dark:border-orange-400 border-0">
              <Calendar className="h-8 w-8 text-orange-500 dark:text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Gestión de Eventos
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Herramientas completas para productoras y organizadores de eventos.
              </p>
            </Card>

            <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-orange-500 dark:border-orange-400 border-0">
              <Star className="h-8 w-8 text-orange-500 dark:text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Experiencia Premium
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Interfaz intuitiva y funcionalidades avanzadas para una experiencia única.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            ¿Por qué elegirnos?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Seguridad Garantizada
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Protegemos tus datos y transacciones con la más alta seguridad.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Soporte 24/7
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Nuestro equipo está disponible para ayudarte en cualquier momento.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Precios Transparentes
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Sin costos ocultos, siempre sabrás exactamente qué pagas.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Variedad de Eventos
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Desde conciertos hasta teatro, tenemos eventos para todos los gustos.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Fácil de Usar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Interfaz intuitiva que hace que comprar entradas sea simple y rápido.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Actualizaciones en Tiempo Real
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Información actualizada sobre disponibilidad y cambios de eventos.
                  </p>
                </div>
              </div>
            </div>
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
            <h2 className="text-3xl font-bold text-white mb-6">
              ¿Listo para vivir experiencias inolvidables?
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Únete a nuestra comunidad y descubre los mejores eventos de Argentina.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/eventos"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-orange-600 font-semibold rounded-full hover:bg-orange-50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Ver Eventos
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/crear"
                  className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Crear Evento
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
