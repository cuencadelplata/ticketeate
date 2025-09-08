'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { NavbarHome } from '@/components/navbar-main';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  Heart, 
  Award, 
  Globe, 
  Calendar,
  Ticket,
  Star,
  CheckCircle
} from 'lucide-react';

export default function SobreNosotrosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Navbar */}
      <NavbarHome />

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Sobre <span className="text-orange-500">Ticketeate</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Somos la plataforma líder en Argentina para la venta de entradas de eventos. 
              Conectamos a productoras, artistas y fans para crear experiencias inolvidables.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <Card className="text-center p-6 bg-white shadow-lg">
              <CardContent className="p-0">
                <div className="text-3xl font-bold text-orange-500 mb-2">50K+</div>
                <div className="text-gray-600">Entradas vendidas</div>
              </CardContent>
            </Card>
            <Card className="text-center p-6 bg-white shadow-lg">
              <CardContent className="p-0">
                <div className="text-3xl font-bold text-orange-500 mb-2">200+</div>
                <div className="text-gray-600">Eventos realizados</div>
              </CardContent>
            </Card>
            <Card className="text-center p-6 bg-white shadow-lg">
              <CardContent className="p-0">
                <div className="text-3xl font-bold text-orange-500 mb-2">15K+</div>
                <div className="text-gray-600">Usuarios activos</div>
              </CardContent>
            </Card>
            <Card className="text-center p-6 bg-white shadow-lg">
              <CardContent className="p-0">
                <div className="text-3xl font-bold text-orange-500 mb-2">98%</div>
                <div className="text-gray-600">Satisfacción</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-orange-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Nuestra Misión</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Democratizar el acceso a eventos culturales y de entretenimiento en Argentina, 
                facilitando la conexión entre productoras, artistas y el público, mientras 
                garantizamos una experiencia de compra segura, rápida y confiable.
              </p>
            </Card>

            <Card className="p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <Globe className="h-8 w-8 text-orange-500 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Nuestra Visión</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Ser la plataforma de referencia en Latinoamérica para la venta de entradas, 
                expandiendo nuestro alcance y conectando a más personas con las experiencias 
                culturales que aman, impulsando la industria del entretenimiento.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 bg-orange-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center bg-white shadow-lg">
              <Heart className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Pasión</h3>
              <p className="text-gray-600">
                Amamos lo que hacemos y creemos en el poder transformador de los eventos culturales.
              </p>
            </Card>

            <Card className="p-6 text-center bg-white shadow-lg">
              <Award className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Excelencia</h3>
              <p className="text-gray-600">
                Nos esforzamos por ofrecer la mejor experiencia posible en cada interacción.
              </p>
            </Card>

            <Card className="p-6 text-center bg-white shadow-lg">
              <Users className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Comunidad</h3>
              <p className="text-gray-600">
                Construimos puentes entre artistas, productoras y fans para crear conexiones duraderas.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">¿Qué Ofrecemos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-white shadow-lg border-l-4 border-orange-500">
              <Ticket className="h-8 w-8 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Venta de Entradas</h3>
              <p className="text-gray-600">
                Sistema seguro y confiable para la compra de entradas con múltiples métodos de pago.
              </p>
            </Card>

            <Card className="p-6 bg-white shadow-lg border-l-4 border-orange-500">
              <Calendar className="h-8 w-8 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestión de Eventos</h3>
              <p className="text-gray-600">
                Herramientas completas para productoras y organizadores de eventos.
              </p>
            </Card>

            <Card className="p-6 bg-white shadow-lg border-l-4 border-orange-500">
              <Star className="h-8 w-8 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Experiencia Premium</h3>
              <p className="text-gray-600">
                Interfaz intuitiva y funcionalidades avanzadas para una experiencia única.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6 bg-orange-50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">¿Por qué elegirnos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Seguridad Garantizada</h3>
                  <p className="text-gray-600">Protegemos tus datos y transacciones con la más alta seguridad.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Soporte 24/7</h3>
                  <p className="text-gray-600">Nuestro equipo está disponible para ayudarte en cualquier momento.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Precios Transparentes</h3>
                  <p className="text-gray-600">Sin costos ocultos, siempre sabrás exactamente qué pagas.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Variedad de Eventos</h3>
                  <p className="text-gray-600">Desde conciertos hasta teatro, tenemos eventos para todos los gustos.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fácil de Usar</h3>
                  <p className="text-gray-600">Interfaz intuitiva que hace que comprar entradas sea simple y rápido.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Actualizaciones en Tiempo Real</h3>
                  <p className="text-gray-600">Información actualizada sobre disponibilidad y cambios de eventos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-orange-500">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿Listo para vivir experiencias inolvidables?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Únete a nuestra comunidad y descubre los mejores eventos de Argentina.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/eventos"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-orange-500 font-semibold rounded-full hover:bg-orange-50 transition"
            >
              Ver Eventos
            </Link>
            <Link
              href="/crear"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-orange-500 transition"
            >
              Crear Evento
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
