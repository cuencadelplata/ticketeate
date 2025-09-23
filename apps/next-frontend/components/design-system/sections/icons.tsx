import {
    Calendar,
    MapPin,
    Clock,
    Users,
    Ticket,
    Star,
    Heart,
    Share2,
    Search,
    Filter,
    CreditCard,
    User,
    Settings,
    Bell,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus,
    Check,
    AlertCircle,
    Info,
    Download,
  } from "lucide-react"
  
  const iconCategories = [
    {
      title: "Eventos",
      icons: [
        { name: "Calendar", component: Calendar },
        { name: "MapPin", component: MapPin },
        { name: "Clock", component: Clock },
        { name: "Users", component: Users },
        { name: "Ticket", component: Ticket },
        { name: "Star", component: Star },
      ],
    },
    {
      title: "Interacciones",
      icons: [
        { name: "Heart", component: Heart },
        { name: "Share2", component: Share2 },
        { name: "Search", component: Search },
        { name: "Filter", component: Filter },
        { name: "Plus", component: Plus },
        { name: "Minus", component: Minus },
      ],
    },
    {
      title: "Usuario",
      icons: [
        { name: "CreditCard", component: CreditCard },
        { name: "User", component: User },
        { name: "Settings", component: Settings },
        { name: "Bell", component: Bell },
        { name: "Download", component: Download },
        { name: "Check", component: Check },
      ],
    },
    {
      title: "Navegación",
      icons: [
        { name: "Menu", component: Menu },
        { name: "X", component: X },
        { name: "ChevronLeft", component: ChevronLeft },
        { name: "ChevronRight", component: ChevronRight },
        { name: "AlertCircle", component: AlertCircle },
        { name: "Info", component: Info },
      ],
    },
  ]
  
  export function IconsSection() {
    return (
      <section id="icons" className="bg-stone-900 rounded-xl p-6 border border-stone-800">
        <h2 className="text-2xl font-semibold mb-4">Íconos</h2>
        <p className="text-stone-400 mb-6">Conjunto de íconos optimizado para la plataforma de eventos.</p>
  
        <div className="space-y-6">
          {iconCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-lg font-medium mb-3 text-orange-400">{category.title}</h3>
              <div className="grid grid-cols-6 gap-4">
                {category.icons.map((icon) => {
                  const IconComponent = icon.component
                  return (
                    <div
                      key={icon.name}
                      className="flex flex-col items-center p-3 bg-stone-800 rounded-lg hover:bg-stone-700 transition-colors cursor-pointer group"
                    >
                      <IconComponent className="w-6 h-6 text-stone-300 group-hover:text-orange-400 transition-colors mb-2" />
                      <span className="text-xs text-stone-500 group-hover:text-stone-300 transition-colors">
                        {icon.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
  
        <div className="mt-6 p-4 bg-stone-800 rounded-lg">
          <h4 className="font-medium mb-2">Directrices de Uso</h4>
          <ul className="text-sm text-stone-400 space-y-1">
            <li>• Usar tamaños estándar: 16px, 20px, 24px</li>
            <li>• Color por defecto: text-stone-400</li>
            <li>• Color activo: text-orange-500</li>
            <li>• Importar desde lucide-react</li>
          </ul>
        </div>
      </section>
    )
  }
  