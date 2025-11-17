'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { NavbarHome } from '@/components/navbar-main';
import { Footer } from '@/components/footer';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
              Política de <span className="text-orange-500 dark:text-orange-400">Privacidad</span>
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
              1. Introducción
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              En Ticketeate, protegemos tu privacidad como una prioridad. Esta política explica cómo
              recopilamos, usamos y protegemos tu información personal.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              2. Información que Recopilamos
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Recopilamos información de varias formas:
            </p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-2 mb-8 ml-4">
              <li>
                <strong>Información de registro:</strong> nombre, email, teléfono, contraseña
              </li>
              <li>
                <strong>Información de pago:</strong> datos bancarios, tarjeta de crédito
                (procesados de forma segura)
              </li>
              <li>
                <strong>Información de perfil:</strong> datos de la empresa, ubicación, foto de
                perfil
              </li>
              <li>
                <strong>Información de eventos:</strong> detalles de eventos que creas o en los que
                participas
              </li>
              <li>
                <strong>Datos de uso:</strong> cómo usas la plataforma, dispositivos, ubicación IP
              </li>
            </ul>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              3. Uso de Tu Información
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Usamos tu información para:
            </p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-2 mb-8 ml-4">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Procesar pagos y transacciones</li>
              <li>Comunicarnos contigo sobre tu cuenta</li>
              <li>Enviarte promociones y actualizaciones (con tu consentimiento)</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Prevenir fraude y mejorar la seguridad</li>
            </ul>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              4. Compartición de Datos
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Tu información se comparte solo con:
            </p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-2 mb-8 ml-4">
              <li>Proveedores de pago necesarios para procesar transacciones</li>
              <li>Autoridades legales si es requerido por ley</li>
              <li>Proveedores de servicios que ayudan a mantener la plataforma</li>
            </ul>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Nunca vendemos tu información a terceros para marketing.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              5. Seguridad de Datos
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Implementamos medidas de seguridad de nivel empresarial incluyendo encriptación
              SSL/TLS, autenticación multi-factor y auditorías de seguridad regulares. Sin embargo,
              ningún método es 100% seguro. Haz tu parte usando contraseñas fuertes.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              6. Cookies
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Usamos cookies para mejorar tu experiencia. Puedes controlar las cookies en tu
              navegador. Algunos servicios pueden no funcionar correctamente si deshabilitas todas
              las cookies.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              7. Tus Derechos
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-stone-600 dark:text-stone-300 space-y-2 mb-8 ml-4">
              <li>Acceder a tus datos personales</li>
              <li>Rectificar información inexacta</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Optar por no recibir comunicaciones de marketing</li>
              <li>Portabilidad de datos</li>
            </ul>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              8. Retención de Datos
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Retenemos tu información solo mientras sea necesario para proporcionar nuestros
              servicios o cumplir con obligaciones legales. Después de tu solicitud de eliminación,
              los datos se borran dentro de 30 días, excepto donde la ley requiera retención.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              9. Usuarios Menores de Edad
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Ticketeate es solo para usuarios mayores de 18 años. No recopilamos información de
              menores intencionalmente. Si descubrimos que hemos recopilado datos de un menor, los
              eliminaremos inmediatamente.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              10. Cambios en Esta Política
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Nos reservamos el derecho de actualizar esta política. Te notificaremos de cambios
              significativos por email o mediante un aviso destacado en nuestro sitio.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              11. Contacto y Derechos
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
              Si tienes preguntas sobre esta política o deseas ejercer tus derechos, contacta a:
            </p>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Email: privacy@ticketeate.com
              <br />
              Dirección: Buenos Aires, Argentina
              <br />
              También puedes presentar una queja ante la autoridad de protección de datos de tu
              jurisdicción.
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
              12. GDPR Compliance (Residentes de UE)
            </h2>
            <p className="text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
              Si eres residente de la Unión Europea, tus datos están protegidos bajo el GDPR. Tienes
              derechos adicionales incluyendo el derecho al olvido y portabilidad de datos. Contacta
              a nuestro Oficial de Protección de Datos para más información.
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
