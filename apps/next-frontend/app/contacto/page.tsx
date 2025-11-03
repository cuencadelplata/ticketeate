'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Clock, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío del formulario
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success('¡Mensaje enviado correctamente!', {
        description: 'Nos pondremos en contacto contigo pronto.',
      });

      setIsSubmitted(true);
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
      });
    } catch (error) {
      // Log the error so the caught exception is handled and not unused
      console.error(error);
      toast.error('Error al enviar el mensaje', {
        description: 'Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'hola@ticketeate.com',
      description: 'Escríbenos cualquier duda',
    },
    {
      icon: Phone,
      title: 'Teléfono',
      content: '+34 900 123 456',
      description: 'Lunes a Viernes 9:00-18:00',
    },
    {
      icon: Clock,
      title: 'Horario',
      content: '24/7 Online',
      description: 'Soporte técnico disponible',
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r bg-black text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl mb-6 font-instrument-serif">
              Contacta con nosotros
            </h1>
            <p className="text-xl md:text-base text-stone-200 mb-8">
              Estamos aquí para ayudarte a crear eventos increíbles
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-stone-300">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-400" />
                Respuesta en 24h
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-400" />
                Soporte técnico
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-orange-400" />
                Consultoría gratuita
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Formulario de Contacto */}
            <div>
              <Card className="bg-white backdrop-blur-sm border-stone-200 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Send className="w-6 h-6" />
                    Envíanos un mensaje
                  </CardTitle>
                  <CardDescription className="text-orange-100">
                    Completa el formulario y nos pondremos en contacto contigo
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  {isSubmitted ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-stone-800 mb-2">¡Mensaje enviado!</h3>
                      <p className="text-stone-600 mb-6">
                        Gracias por contactarnos. Te responderemos pronto.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Enviar otro mensaje
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="nombre"
                            className="block text-sm font-medium text-stone-700 mb-2"
                          >
                            Nombre completo *
                          </label>
                          <Input
                            id="nombre"
                            name="nombre"
                            type="text"
                            required
                            value={formData.nombre}
                            onChange={handleInputChange}
                            className="border-stone-300 focus:border-orange-500 focus:ring-orange-500"
                            placeholder="Tu nombre completo"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-stone-700 mb-2"
                          >
                            Email *
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="border-stone-300 focus:border-orange-500 focus:ring-orange-500"
                            placeholder="tu@email.com"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="telefono"
                            className="block text-sm font-medium text-stone-700 mb-2"
                          >
                            Teléfono
                          </label>
                          <Input
                            id="telefono"
                            name="telefono"
                            type="tel"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            className="border-stone-300 focus:border-orange-500 focus:ring-orange-500"
                            placeholder="+34 600 000 000"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="asunto"
                            className="block text-sm font-medium text-stone-700 mb-2"
                          >
                            Asunto *
                          </label>
                          <Input
                            id="asunto"
                            name="asunto"
                            type="text"
                            required
                            value={formData.asunto}
                            onChange={handleInputChange}
                            className="border-stone-300 focus:border-orange-500 focus:ring-orange-500"
                            placeholder="¿En qué podemos ayudarte?"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="mensaje"
                          className="block text-sm font-medium text-stone-700 mb-2"
                        >
                          Mensaje *
                        </label>
                        <Textarea
                          id="mensaje"
                          name="mensaje"
                          required
                          rows={6}
                          value={formData.mensaje}
                          onChange={handleInputChange}
                          className="border-stone-300 focus:border-orange-500 focus:ring-orange-500"
                          placeholder="Cuéntanos más detalles sobre tu consulta..."
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 text-lg"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Enviando...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="w-5 h-5" />
                            Enviar mensaje
                          </div>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl text-stone-200 mb-4 font-instrument-serif">
                  Información de contacto
                </h2>
                <p className="text-lg text-stone-200 mb-8">
                  Estamos disponibles para ayudarte con cualquier consulta sobre nuestros servicios.
                  No dudes en contactarnos por cualquier medio.
                </p>
              </div>

              <div className="grid gap-6">
                {contactInfo.map((item) => (
                  <Card
                    key={item.title}
                    className="bg-white backdrop-blur-sm border-stone-200 hover:shadow-lg transition-all duration-300 hover:bg-white/80"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-lg">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-stone-800 mb-1">
                            {item.title}
                          </h3>
                          <p className="text-stone-700 font-medium mb-1">{item.content}</p>
                          <p className="text-stone-500 text-sm">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
