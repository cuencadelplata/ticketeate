"use client"

import { Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BrandAssetsSection() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <section id="brand-assets" className="bg-stone-900 rounded-xl p-6 border border-stone-800">
      <h2 className="text-2xl font-semibold mb-4">Recursos de Marca</h2>
      <p className="text-stone-400 mb-6">Wordmark y recursos de marca de Ticketeate en sus diferentes versiones.</p>

      <div className="space-y-8">
        <div className="bg-stone-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Wordmark Principal</h3>
          <div className="bg-white rounded-lg p-12 mb-4 flex items-center justify-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Ticketeate
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <span>Versión principal para fondos claros</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-stone-600 text-stone-400 hover:bg-stone-700 bg-transparent"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar SVG
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-stone-600 text-stone-400 hover:bg-stone-700 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-stone-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Variaciones del Wordmark</h3>
          <div className="grid gap-6">
            {/* Light version */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-stone-300">Versión Clara</h4>
              <div className="bg-white rounded-lg p-8 flex items-center justify-center">
                <span className="text-3xl font-bold text-orange-600">Ticketeate</span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Para fondos claros y blancos</span>
                <button
                  onClick={() => copyToClipboard("#ea580c")}
                  className="flex items-center gap-1 hover:text-orange-400 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  #ea580c
                </button>
              </div>
            </div>

            {/* Dark version */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-stone-300">Versión Oscura</h4>
              <div className="bg-stone-950 rounded-lg p-8 flex items-center justify-center border border-stone-700">
                <span className="text-3xl font-bold text-orange-400">Ticketeate</span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Para fondos oscuros</span>
                <button
                  onClick={() => copyToClipboard("#fb923c")}
                  className="flex items-center gap-1 hover:text-orange-400 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  #fb923c
                </button>
              </div>
            </div>

            {/* Monochrome versions */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-stone-300">Monocromático Negro</h4>
                <div className="bg-white rounded-lg p-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-black">Ticketeate</span>
                </div>
                <div className="text-xs text-stone-500">Para impresión en blanco y negro</div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-stone-300">Monocromático Blanco</h4>
                <div className="bg-stone-950 rounded-lg p-6 flex items-center justify-center border border-stone-700">
                  <span className="text-2xl font-bold text-white">Ticketeate</span>
                </div>
                <div className="text-xs text-stone-500">Para fondos oscuros sin color</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-stone-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Iconos y Favicon</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-stone-300">Favicon 32x32</h4>
              <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-stone-300">Icono App 64x64</h4>
              <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-stone-300">Icono Cuadrado</h4>
              <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">Te</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-stone-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Directrices de Uso</h3>
          <div className="space-y-4 text-sm text-stone-300">
            <div>
              <h4 className="font-medium text-orange-400 mb-2">Espaciado Mínimo</h4>
              <p className="text-stone-400">
                Mantener un espacio mínimo equivalente a la altura de la letra "T" alrededor del wordmark.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-orange-400 mb-2">Tamaño Mínimo</h4>
              <p className="text-stone-400">
                El wordmark no debe ser menor a 120px de ancho en medios digitales o 20mm en medios impresos.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-orange-400 mb-2">Colores Permitidos</h4>
              <p className="text-stone-400">
                Usar únicamente los colores especificados: naranja principal, blanco, negro o monocromático.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
