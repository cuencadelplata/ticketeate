'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, Share2, MapPin, Calendar } from 'lucide-react';

export default function EventPage() {
  return (
    <div className="min-h-screen bg-[#0a0d14]">
      {/* Top Navigation */}
      <div className="border-b border-gray-800 p-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400">
            <span>Personal</span>
            <span>›</span>
            <span className="text-white">test</span>
          </div>
          <Button variant="outline" className="border-gray-700 bg-[#2a2f3c] text-white">
            Página del evento
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl p-4">
        {/* Tabs Navigation */}
        <Tabs defaultValue="resumen" className="mb-6">
          <TabsList className="w-full justify-start gap-6 border-b border-gray-800 bg-transparent">
            <TabsTrigger
              value="resumen"
              className="rounded-none text-white data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="invitados"
              className="rounded-none text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white"
            >
              Invitados
            </TabsTrigger>
            <TabsTrigger
              value="inscripcion"
              className="rounded-none text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white"
            >
              Inscripción
            </TabsTrigger>
            <TabsTrigger
              value="difusiones"
              className="rounded-none text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white"
            >
              Difusiones
            </TabsTrigger>
            <TabsTrigger
              value="informacion"
              className="rounded-none text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white"
            >
              Información
            </TabsTrigger>
            <TabsTrigger
              value="mas"
              className="rounded-none text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white"
            >
              Más
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <Button className="gap-2 bg-[#2a2f3c] text-white hover:bg-[#3a3f4c]">
            <Users size={20} />
            Invitar invitados
          </Button>
          <Button className="gap-2 bg-[#2a2f3c] text-white hover:bg-[#3a3f4c]">
            <MessageSquare size={20} />
            Enviar un mensaje
          </Button>
          <Button className="gap-2 bg-[#2a2f3c] text-white hover:bg-[#3a3f4c]">
            <Share2 size={20} />
            Compartir evento
          </Button>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Card className="border-gray-800 bg-[#0d1117] p-6">
              <div className="flex gap-4">
                <div className="h-32 w-32 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <div className="flex-1">
                  <h2 className="mb-4 text-2xl font-bold text-white">test</h2>
                  <div className="mb-2 flex items-center gap-2 text-gray-400">
                    <Calendar size={16} />
                    <span>Lunes, 24 de febrero</span>
                    <span>2:00 - 3:00</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={16} />
                    <span>Buenos Aires, Buenos Aires</span>
                  </div>

                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-medium text-gray-400">Inscripción</h3>
                    <div className="rounded bg-[#161b22] p-4">
                      <p className="mb-4 text-gray-400">
                        ¡Bienvenido! Por favor, elige el tipo de entrada que deseas:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between rounded bg-[#1c2128] p-2">
                          <span className="text-white">Standard</span>
                          <span className="text-gray-400">Gratis</span>
                        </div>
                        <div className="flex items-center justify-between rounded bg-[#1c2128] p-2">
                          <span className="text-white">VIP</span>
                          <span className="text-gray-400">Gratis</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <Card className="border-gray-800 bg-[#0d1117] p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Cuándo y dónde</h3>
              <div className="mb-6">
                <div className="mb-4 flex items-start gap-4">
                  <div className="min-w-[60px] rounded bg-[#161b22] p-2 text-center">
                    <div className="text-xs text-gray-400">FEB</div>
                    <div className="text-xl font-bold text-white">24</div>
                  </div>
                  <div>
                    <div className="text-white">hoy</div>
                    <div className="text-gray-400">2:00 - 3:00 GMT-3</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded bg-[#161b22] p-2">
                    <MapPin size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <div className="text-white">Buenos Aires</div>
                    <div className="text-gray-400">Argentina</div>
                    <div className="mt-2 text-sm text-gray-400">
                      La dirección se muestra públicamente en la página del evento.
                    </div>
                  </div>
                </div>
              </div>
              <Button className="w-full bg-[#2a2f3c] text-white hover:bg-[#3a3f4c]">
                Registrar invitados
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
