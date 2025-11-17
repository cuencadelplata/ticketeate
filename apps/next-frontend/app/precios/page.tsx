'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Zap, Users, BarChart3, Shield } from 'lucide-react';

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfecto para comenzar',
    price: '0',
    period: 'Siempre gratis',
    features: [
      'Hasta 5 eventos',
      'Hasta 1,000 entradas por evento',
      'Panel de control básico',
      'Reportes simples',
      'Soporte por email',
      { name: 'Integraciones avanzadas', included: false },
      { name: 'API REST', included: false },
      { name: 'Soporte prioritario', included: false },
    ],
    cta: 'Comenzar gratis',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'Para crecer rápido',
    price: '2.99',
    period: 'por venta',
    features: [
      'Eventos ilimitados',
      'Entradas ilimitadas',
      'Panel avanzado',
      'Reportes detallados en tiempo real',
      'Soporte prioritario 24/7',
      'Integraciones avanzadas',
      { name: 'API REST', included: false },
      { name: 'Análisis predictivos', included: false },
    ],
    cta: 'Mejorar a Pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'Solución empresarial',
    price: 'Personalizado',
    period: 'Contacta a ventas',
    features: [
      'Eventos ilimitados',
      'Entradas ilimitadas',
      'Panel personalizado',
      'Reportes personalizados',
      'Soporte dedicado 24/7',
      'Integraciones personalizadas',
      'API REST completa',
      'Análisis predictivos',
    ],
    cta: 'Contactar ventas',
    highlighted: false,
  },
];

const faqs = [
  {
    question: '¿Hay cargos ocultos?',
    answer:
      'No. Somos totalmente transparentes con nuestros precios. Lo que ves es lo que pagas. No hay comisiones adicionales ni cargos sorpresa.',
  },
  {
    question: '¿Puedo cambiar de plan cuando quiera?',
    answer:
      'Sí, puedes cambiar o cancelar tu plan en cualquier momento. No hay contrato a largo plazo ni penalizaciones por cancelación.',
  },
  {
    question: '¿Cómo funciona la comisión por venta?',
    answer:
      'En el plan Pro, cobramos 2.99% por cada entrada vendida. Esta comisión se deduce automáticamente cuando procesas el pago.',
  },
  {
    question: '¿Qué incluye el plan Starter?',
    answer:
      'El plan Starter es completamente gratis y te permite crear hasta 5 eventos con hasta 1,000 entradas cada uno. Es ideal para probar la plataforma.',
  },
];

export default function PreciosPage() {
  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-900">
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
              Planes <span className="text-orange-500 dark:text-orange-400">Transparentes</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto leading-relaxed px-4">
              Elige el plan que mejor se adapte a tu negocio. Sin sorpresas, sin comisiones ocultas.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white dark:bg-stone-800">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-xl transition-all duration-300 ${
                  plan.highlighted
                    ? 'ring-2 ring-orange-500 dark:ring-orange-400 scale-105 md:scale-110'
                    : 'border border-stone-200 dark:border-stone-600'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-block px-4 py-1 bg-orange-500 text-white text-sm font-semibold rounded-full">
                      Más popular
                    </span>
                  </div>
                )}
                <Card
                  className={`h-full ${
                    plan.highlighted
                      ? 'bg-gradient-to-br from-orange-50 to-stone-50 dark:from-orange-900/20 dark:to-stone-800'
                      : 'bg-stone-50 dark:bg-stone-700'
                  } border-0`}
                >
                  <CardContent className="p-6 sm:p-8">
                    <div className="mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-stone-600 dark:text-stone-300 text-sm">
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-bold text-orange-500 dark:text-orange-400">
                          {plan.price}
                        </span>
                        {plan.price !== 'Personalizado' && (
                          <span className="text-stone-600 dark:text-stone-300 text-sm">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      {plan.price === 'Personalizado' && (
                        <p className="text-stone-600 dark:text-stone-300 text-sm mt-2">
                          {plan.period}
                        </p>
                      )}
                    </div>

                    <button
                      className={`w-full py-3 px-4 font-semibold rounded-lg transition-colors duration-200 mb-8 ${
                        plan.highlighted
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-stone-200 hover:bg-stone-300 dark:bg-stone-600 dark:hover:bg-stone-500 text-stone-900 dark:text-white'
                      }`}
                    >
                      {plan.cta}
                    </button>

                    <div className="space-y-4">
                      {plan.features.map((feature, idx) => {
                        const included = typeof feature === 'string' || feature.included !== false;
                        return (
                          <div key={idx} className="flex items-start gap-3">
                            {included ? (
                              <Check className="h-5 w-5 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <X className="h-5 w-5 text-stone-300 dark:text-stone-600 flex-shrink-0 mt-0.5" />
                            )}
                            <span
                              className={`text-sm ${
                                included
                                  ? 'text-stone-700 dark:text-stone-200'
                                  : 'text-stone-400 dark:text-stone-500'
                              }`}
                            >
                              {typeof feature === 'string' ? feature : feature.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
              Todas los planes incluyen
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                icon: Zap,
                title: 'Velocidad',
                description: 'Procesamiento de pagos instantáneo',
              },
              {
                icon: Shield,
                title: 'Seguridad',
                description: 'Encriptación de datos de nivel bancario',
              },
              {
                icon: Users,
                title: 'Comunidad',
                description: 'Acceso a nuestra comunidad de productores',
              },
              {
                icon: BarChart3,
                title: 'Analítica',
                description: 'Datos y reportes sobre tus ventas',
              },
            ].map((feature, index) => {
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
                    <Icon className="h-6 w-6 text-orange-500 dark:text-orange-400" />
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

      {/* FAQs Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white dark:bg-stone-800">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-4">
              Preguntas Frecuentes
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="border border-stone-200 dark:border-stone-600 rounded-lg p-4 sm:p-6 bg-stone-50 dark:bg-stone-700 hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-stone-600 dark:text-stone-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">
              Comienza ahora
            </h2>
            <p className="text-lg text-orange-50 mb-8">
              Crea tu primer evento gratis y sin limitaciones de tiempo
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-orange-50 text-orange-600 font-semibold rounded-lg transition-colors duration-200"
            >
              Registrarse gratis
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
