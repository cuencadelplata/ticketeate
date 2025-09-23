"use client"

import { Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function BrandAssetsSection() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadAsset = (url: string, filename: string) => {
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section id="brand-assets" className="bg-stone-900 rounded-xl p-6 border border-stone-800">
      <h2 className="text-2xl font-semibold mb-4">Recursos de Marca</h2>
      <p className="text-stone-400 mb-6">Wordmark y recursos de marca de Ticketeate en sus diferentes versiones.</p>

      <div className="space-y-8">
        <div className="bg-stone-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Wordmark Principal</h3>
          <div className="bg-stone-950 border border-stone-700 rounded-lg p-12 mb-4 flex items-center justify-center">
            <Image
              src="/wordmark-light.png"
              alt="Ticketeate wordmark"
              width={420}
              height={96}
              priority
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <span>Versión principal para fondos oscuros</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-stone-600 text-stone-400 hover:bg-stone-700 bg-transparent"
                onClick={() => copyToClipboard(window.location.origin + "/wordmark-light.png")}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar URL
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-stone-600 text-stone-400 hover:bg-stone-700 bg-transparent"
                onClick={() => downloadAsset("/wordmark-light.png", "ticketeate-wordmark.png")}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar PNG
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-stone-800 rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Variaciones del Wordmark</h3>
          <div className="grid gap-6">

            {/* Dark context preview (using current asset) */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-stone-300">Vista en Fondo Oscuro</h4>
              <div className="bg-stone-950 rounded-lg p-8 flex items-center justify-center border border-stone-700">
                <Image src="/wordmark-light.png" alt="Ticketeate wordmark en oscuro" width={320} height={72} />
              </div>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Previsualización sobre fondos oscuros</span>
                <button
                  onClick={() => copyToClipboard(window.location.origin + "/wordmark-light.png")}
                  className="flex items-center gap-1 hover:text-orange-400 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copiar URL
                </button>
              </div>
            </div>

            {/* Monochrome versions (referencia) */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-stone-300">Icono sobre fondo claro</h4>
                <div className="bg-white rounded-lg p-6 flex items-center justify-center">
                  <Image src="/icon-ticketeate.png" alt="Icono Ticketeate claro" width={64} height={64} />
                </div>
                <div className="text-xs text-stone-500">Uso recomendado para fondos claros</div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-stone-300">Icono sobre fondo oscuro</h4>
                <div className="bg-stone-950 rounded-lg p-6 flex items-center justify-center border border-stone-700">
                  <Image src="/icon-ticketeate.png" alt="Icono Ticketeate oscuro" width={64} height={64} />
                </div>
                <div className="text-xs text-stone-500">Uso recomendado para fondos oscuros</div>
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
                <Image src="/icon-ticketeate.png" alt="Favicon Ticketeate 32" width={32} height={32} />
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-stone-300">Icono App 64x64</h4>
              <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                <Image src="/icon-ticketeate.png" alt="Icono Ticketeate 64" width={64} height={64} />
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-stone-300">Icono Cuadrado</h4>
              <div className="bg-white rounded-lg p-4 flex items-center justify-center">
                <Image src="/icon-ticketeate.png" alt="Icono Ticketeate" width={48} height={48} />
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
