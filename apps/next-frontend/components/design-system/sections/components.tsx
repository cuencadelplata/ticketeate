import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Star, Download } from "lucide-react"

export function ComponentsSection() {
  return (
    <section id="components" className="bg-stone-900 rounded-xl p-6 border border-stone-800">
      <h2 className="text-2xl font-semibold mb-4">Componentes</h2>
      <p className="text-stone-400 mb-6">Componentes reutilizables para la interfaz de Ticketeate.</p>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4 text-orange-400">Botones</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button className="bg-orange-500 hover:bg-orange-600">Comprar Tickets</Button>
              <Button
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white bg-transparent"
              >
                Ver Detalles
              </Button>
              <Button variant="ghost" className="text-orange-500 hover:bg-orange-500/10">
                Favoritos
              </Button>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
            <div className="text-xs text-stone-500 bg-stone-800 p-3 rounded font-mono">
              {`<Button className="bg-orange-500 hover:bg-orange-600">Comprar Tickets</Button>`}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 text-orange-400">Tarjetas de Eventos</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4 bg-stone-800 border-stone-700">
              <div className="aspect-video bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-white font-semibold">Imagen del Evento</span>
              </div>
              <h4 className="font-semibold mb-2">Concierto de Rock 2024</h4>
              <p className="text-stone-400 text-sm mb-3">Una noche épica con las mejores bandas de rock nacional.</p>
              <div className="flex items-center gap-4 text-sm text-stone-400 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>15 Mar</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Arena Central</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>5000</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Música</Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Disponible</Badge>
                </div>
                <span className="font-semibold text-orange-400">$25.000</span>
              </div>
            </Card>

            <Card className="p-4 bg-stone-800 border-stone-700">
              <h4 className="font-semibold mb-2">Teatro Clásico</h4>
              <p className="text-stone-400 text-sm mb-3">Una obra maestra del teatro contemporáneo.</p>
              <div className="flex items-center gap-4 text-sm text-stone-400 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>22 Mar</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Teatro Municipal</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Teatro</Badge>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Últimas entradas</Badge>
                </div>
                <span className="font-semibold text-orange-400">$18.000</span>
              </div>
            </Card>
          </div>
          <div className="text-xs text-stone-500 bg-stone-800 p-3 rounded font-mono mt-4">
            {`<Card className="p-4 bg-stone-800 border-stone-700">...</Card>`}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 text-orange-400">Campos de Entrada</h3>
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Input
                placeholder="Buscar eventos, artistas, lugares..."
                className="bg-stone-800 border-stone-700 focus:border-orange-500 pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <Input
              placeholder="Correo electrónico"
              type="email"
              className="bg-stone-800 border-stone-700 focus:border-orange-500"
            />
            <Input
              placeholder="Número de teléfono"
              type="tel"
              className="bg-stone-800 border-stone-700 focus:border-orange-500"
            />
          </div>
          <div className="text-xs text-stone-500 bg-stone-800 p-3 rounded font-mono">
            {`<Input className="bg-stone-800 border-stone-700 focus:border-orange-500" />`}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 text-orange-400">Etiquetas y Estados</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-stone-300 mb-2">Categorías de Eventos</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-orange-500">Destacado</Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Concierto</Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Teatro</Badge>
                <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">Comedia</Badge>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Deportes</Badge>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-stone-300 mb-2">Estados de Disponibilidad</h4>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Disponible</Badge>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pocas entradas</Badge>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Agotado</Badge>
                <Badge variant="outline" className="border-stone-600 text-stone-400">
                  Próximamente
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-xs text-stone-500 bg-stone-800 p-3 rounded font-mono mt-4">
            {`<Badge className="bg-orange-500">Destacado</Badge>`}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4 text-orange-400">Calificaciones</h3>
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-orange-500 text-orange-500" />
                ))}
              </div>
              <span className="text-sm text-stone-400">(4.8) 234 reseñas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-orange-500 text-orange-500" />
                ))}
                <Star className="w-5 h-5 text-stone-600" />
              </div>
              <span className="text-sm text-stone-400">(4.2) 89 reseñas</span>
            </div>
          </div>
          <div className="text-xs text-stone-500 bg-stone-800 p-3 rounded font-mono">
            {`<Star className="w-5 h-5 fill-orange-500 text-orange-500" />`}
          </div>
        </div>
      </div>
    </section>
  )
}
