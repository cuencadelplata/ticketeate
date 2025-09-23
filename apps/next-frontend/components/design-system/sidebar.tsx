"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationItems = [
  {
    title: "Introducción",
    href: "/design-system",
  },
  {
    title: "Fundamentos",
    items: [
      { name: "Colores", href: "/design-system/colores" },
      { name: "Íconos", href: "/design-system/iconos" },
      { name: "Recursos de Marca", href: "/design-system/recursos-de-marca" },
    ],
  },
  {
    title: "Componentes",
    items: [{ name: "Componentes UI", href: "/design-system/componentes" }],
  },
]

export function Sidebar() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["Fundamentos"])
  const pathname = usePathname()

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
  }

  return (
    <div className="w-80 bg-stone-950 border-r border-stone-800 h-screen overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <h1 className="text-xl font-semibold">Sistema de Diseño Ticketeate</h1>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((section) => (
            <div key={section.title}>
              {section.href ? (
                <Link
                  href={section.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === section.href
                      ? "text-orange-300 bg-orange-500/20 border border-orange-500/30"
                      : "text-stone-300 hover:text-white hover:bg-stone-800"
                  }`}
                >
                  {section.title}
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-stone-300 hover:text-white hover:bg-stone-800 rounded-md transition-colors"
                  >
                    {section.title}
                    {expandedSections.includes(section.title) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {expandedSections.includes(section.title) && section.items && (
                    <div className="ml-4 mt-1 space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                            pathname === item.href
                              ? "text-orange-300 bg-orange-500/20 border border-orange-500/30"
                              : "text-stone-400 hover:text-white hover:bg-stone-800"
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
