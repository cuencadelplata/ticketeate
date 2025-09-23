import Link from "next/link"
import { Sparkles, Package, Grid3X3, Calendar, Star, Ticket } from "lucide-react"

export function MainContent() {
  return (
    <div className="flex-1 p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl mb-2">Sistema de Diseño Ticketeate</h1>
        <p className="text-base text-stone-400">
          Sistema de diseño unificado para crear experiencias consistentes en la plataforma de eventos.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-4xl">
        <Link
          href="/design-system/recursos-de-marca"
          className="group block bg-stone-900 rounded-xl border border-stone-800 hover:border-orange-500 transition-all duration-200 hover:bg-stone-800 overflow-hidden"
        >
          <div className="p-8 pb-4">
            <div className="flex items-center justify-center h-24 mb-6 bg-stone-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Ticket className="w-8 h-8 text-orange-500" />
                <span className="text-2xl font-bold text-white">Ticketeate</span>
              </div>
            </div>
          </div>
          <div className="px-8 pb-8">
            <h3 className="text-xl font-semibold mb-2">Recursos de Marca</h3>
            <p className="text-stone-400 group-hover:text-stone-300 transition-colors">
              Logos, wordmarks y elementos de identidad visual de Ticketeate.
            </p>
          </div>
        </Link>

        <Link
          href="/design-system/iconos"
          className="group block bg-stone-900 rounded-xl border border-stone-800 hover:border-orange-500 transition-all duration-200 hover:bg-stone-800 overflow-hidden"
        >
          <div className="p-8 pb-4">
            <div className="h-24 mb-6 bg-stone-800 rounded-lg p-4">
              <div className="grid grid-cols-6 gap-2 h-full">
                <div className="flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-stone-400" />
                </div>
                <div className="flex items-center justify-center">
                  <Ticket className="w-4 h-4 text-stone-400" />
                </div>
                <div className="flex items-center justify-center">
                  <Star className="w-4 h-4 text-stone-400" />
                </div>
                <div className="flex items-center justify-center">
                  <Package className="w-4 h-4 text-stone-400" />
                </div>
                <div className="flex items-center justify-center">
                  <Grid3X3 className="w-4 h-4 text-stone-400" />
                </div>
                <div className="flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            </div>
          </div>
          <div className="px-8 pb-8">
            <h3 className="text-xl font-semibold mb-2">Íconos</h3>
            <p className="text-stone-400 group-hover:text-stone-300 transition-colors">
              Conjunto de íconos organizados por categorías para la plataforma.
            </p>
          </div>
        </Link>

        <Link
          href="/design-system/componentes"
          className="group block bg-stone-900 rounded-xl border border-stone-800 hover:border-orange-500 transition-all duration-200 hover:bg-stone-800 overflow-hidden"
        >
          <div className="p-8 pb-4">
            <div className="h-24 mb-6 bg-stone-800 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="h-6 bg-orange-500 rounded px-3 flex items-center">
                  <span className="text-xs text-white font-medium">Botón</span>
                </div>
                <div className="h-6 bg-stone-600 rounded px-3 flex items-center">
                  <span className="text-xs text-stone-300">Secundario</span>
                </div>
              </div>
              <div className="h-8 bg-stone-700 rounded px-3 flex items-center">
                <span className="text-xs text-stone-400">Campo de texto</span>
              </div>
            </div>
          </div>
          <div className="px-8 pb-8">
            <h3 className="text-xl font-semibold mb-2">Componentes</h3>
            <p className="text-stone-400 group-hover:text-stone-300 transition-colors">
              Componentes reutilizables para botones, cards, formularios y más.
            </p>
          </div>
        </Link>

        <Link
          href="/design-system/colores"
          className="group block bg-stone-900 rounded-xl border border-stone-800 hover:border-orange-500 transition-all duration-200 hover:bg-stone-800 overflow-hidden"
        >
          <div className="p-8 pb-4">
            <div className="h-24 mb-6 bg-stone-800 rounded-lg p-4 flex items-center justify-center gap-1">
              <div className="w-3 h-16 bg-orange-200 rounded-sm"></div>
              <div className="w-3 h-16 bg-orange-300 rounded-sm"></div>
              <div className="w-3 h-16 bg-orange-400 rounded-sm"></div>
              <div className="w-3 h-16 bg-orange-500 rounded-sm"></div>
              <div className="w-3 h-16 bg-orange-600 rounded-sm"></div>
              <div className="w-3 h-16 bg-orange-700 rounded-sm"></div>
              <div className="w-3 h-16 bg-stone-400 rounded-sm"></div>
              <div className="w-3 h-16 bg-stone-600 rounded-sm"></div>
            </div>
          </div>
          <div className="px-8 pb-8">
            <h3 className="text-xl font-semibold mb-2">Colores</h3>
            <p className="text-stone-400 group-hover:text-stone-300 transition-colors">
              Paleta de colores completa con naranjas vibrantes y neutrales.
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
