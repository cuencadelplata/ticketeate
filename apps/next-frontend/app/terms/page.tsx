'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { NavbarHome } from '@/components/navbar-main';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Navbar */}
      <Suspense fallback={<div className="h-16" />}>
        <NavbarHome />
      </Suspense>

      {/* Header */}
      <section className="pt-24 pb-8 px-4 sm:px-6 bg-gradient-to-br from-orange-50 via-stone-50 to-white dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 dark:text-white mb-4">
              Términos y <span className="text-orange-500 dark:text-orange-400">Condiciones</span>
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-300">
              Última actualización: {new Date().toLocaleDateString('es-AR')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white dark:bg-stone-800">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-stone dark:prose-invert max-w-none"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              1. Aceptación de Términos
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Al acceder y usar Ticketeate, aceptas estar vinculado por estos términos y
              condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes usar
              nuestro servicio.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              2. Descripción del Servicio
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Ticketeate es una plataforma digital que facilita la venta de entradas para eventos.
              Actuamos como intermediarios entre productores de eventos y compradores de entradas.
              No somos responsables por los eventos en sí, sino por el funcionamiento de la
              plataforma.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              3. Registro de Usuario
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Para usar Ticketeate, debes registrarte con información verídica y completa. Eres
              responsable de:
            </p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-2 mb-8 ml-4">
              <li>Mantener la confidencialidad de tu contraseña</li>
              <li>No compartir tu cuenta con terceros</li>
              <li>Notificarnos de cualquier acceso no autorizado</li>
              <li>Mantener tus datos personales actualizados</li>
            </ul>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              4. Restricciones de Uso
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">No debes:</p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-2 mb-8 ml-4">
              <li>Usar la plataforma para actividades ilegales</li>
              <li>Crear múltiples cuentas para evadir restricciones</li>
              <li>Interferir con el funcionamiento técnico del servicio</li>
              <li>Usar bots o scripts para automatizar compras</li>
              <li>Hacer spam o participar en fraude</li>
            </ul>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              5. Compra de Entradas
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Al comprar una entrada en Ticketeate:
            </p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-2 mb-8 ml-4">
              <li>Aceptas los términos específicos del evento</li>
              <li>Eres responsable de proporcionar información de pago válida</li>
              <li>Las entradas son nominales y no transferibles (salvo indicación contraria)</li>
              <li>No reembolsables salvo política específica del evento</li>
            </ul>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              6. Política de Pagos
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Todos los pagos se procesan a través de nuestros partners de pago autorizados.
              Ticketeate mantiene una comisión por cada transacción según el plan elegido. Los
              fondos se depositan en la cuenta del productor dentro de 2-5 días hábiles.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              7. Responsabilidad Limitada
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Ticketeate no es responsable por daños indirectos, incidentales o consecuentes.
              Nuestra responsabilidad total se limita al monto pagado por el usuario en los últimos
              12 meses.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              8. Modificación de Términos
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los
              cambios significativos se notificarán con 30 días de anticipación.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              9. Terminación
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Podemos terminar tu acceso a Ticketeate si violas estos términos. Tienes derecho a
              solicitar información sobre tus transacciones finales.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              10. Jurisdicción
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Estos términos se rigen por las leyes de Argentina. Cualquier disputa será resuelta
              ante los tribunales competentes de Argentina.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              11. Contacto
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Para preguntas sobre estos términos, contacta a:
            </p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Email: legal@ticketeate.com
              <br />
              Dirección: Buenos Aires, Argentina
            </p>

            <div className="border-t border-stone-200 dark:border-stone-600 pt-8 mt-12">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                © {new Date().getFullYear()} Ticketeate. Todos los derechos reservados.
              </p>
            </div>
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
