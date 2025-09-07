import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarDays,
  MapPin,
  Users,
  Edit,
  Trash2,
  Mail,
  TrendingUp,
  DollarSign,
  Eye,
  ArrowLeft,
  Copy,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react"

// Datos de ejemplo - en una app real vendrían de una API
const eventData = {
  id: 1,
  title: "Conferencia Tech 2024",
  description:
    "La conferencia más importante de tecnología del año. Únete a nosotros para descubrir las últimas tendencias en desarrollo, IA y startups.",
  date: "2024-03-15",
  time: "09:00 - 18:00",
  location: "Centro de Convenciones",
  address: "Av. Principal 123, Ciudad",
  attendees: 450,
  capacity: 500,
  price: 150,
  status: "active",
  image: "/tech-conference-hall.png",
  organizer: "TechEvents Corp",
  category: "Tecnología",
  website: "https://techconf2024.com",
}

const metrics = {
  totalSales: 67500,
  ticketsSold: 450,
  conversionRate: 12.5,
  pageViews: 3600,
}

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header con navegación */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Eventos
            </Link>
          </Button>
        </div>

        {/* Encabezado del evento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="aspect-video relative mb-6 rounded-lg overflow-hidden">
              <img
                src={eventData.image || "/placeholder.svg"}
                alt={eventData.title}
                className="w-full h-full object-cover"
              />
              <Badge className={`absolute top-4 left-4 ${eventData.status === "active" ? "bg-primary" : "bg-muted"}`}>
                {eventData.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground">{eventData.title}</h1>
              <p className="text-muted-foreground text-lg">{eventData.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <CalendarDays className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Fecha y Hora</p>
                    <p className="text-muted-foreground">
                      {new Date(eventData.date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      • {eventData.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Ubicación</p>
                    <p className="text-muted-foreground">{eventData.location}</p>
                    <p className="text-muted-foreground text-xs">{eventData.address}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Asistencia</p>
                    <p className="text-muted-foreground">
                      {eventData.attendees} / {eventData.capacity} personas
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Precio</p>
                    <p className="text-muted-foreground">${eventData.price}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de acciones */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-transparent" variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Evento
                </Button>

                <Button className="w-full bg-transparent" variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Invitaciones
                </Button>

                <Button className="w-full bg-transparent" variant="outline">
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Enlace
                </Button>

                <Button className="w-full" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Evento
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compartir Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-transparent" variant="outline">
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>

                <Button className="w-full bg-transparent" variant="outline">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>

                <Button className="w-full bg-transparent" variant="outline">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs con métricas y detalles */}
        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="attendees">Asistentes</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.totalSales.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% desde la semana pasada</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Entradas Vendidas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.ticketsSold}</div>
                  <p className="text-xs text-muted-foreground">90% de capacidad</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
                  <p className="text-xs text-muted-foreground">+2.1% desde el mes pasado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visualizaciones</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.pageViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+5% desde ayer</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attendees">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Asistentes</CardTitle>
                <CardDescription>Gestiona los asistentes registrados para este evento</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Funcionalidad de gestión de asistentes próximamente...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">Organizador</p>
                    <p className="text-muted-foreground">{eventData.organizer}</p>
                  </div>
                  <div>
                    <p className="font-medium">Categoría</p>
                    <p className="text-muted-foreground">{eventData.category}</p>
                  </div>
                  <div>
                    <p className="font-medium">Sitio Web</p>
                    <a href={eventData.website} className="text-primary hover:underline">
                      {eventData.website}
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Opciones de configuración del evento próximamente...</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
