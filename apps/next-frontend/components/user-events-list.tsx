'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/use-events';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@heroui/react';
import { Calendar, MapPin, Users, Edit, Trash, Eye } from 'lucide-react';
import EditEventForm from './edit-event-form';
import { toast } from 'sonner';
import type { Event } from '@/types/events';

export default function UserEventsList() {
  const { isSignedIn } = useAuth();
  const { data: events, isLoading, error, refetch } = useEvents();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  if (!isSignedIn) {
    return (
      <div className="text-center py-8">
        <p className="text-stone-400">Debes iniciar sesión para ver tus eventos</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-stone-900/50 animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-stone-700 rounded mb-2"></div>
              <div className="h-3 bg-stone-700 rounded mb-4"></div>
              <div className="h-3 bg-stone-700 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">Error al cargar los eventos</p>
        <Button onClick={() => refetch()} variant="faded">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-stone-400 mb-4">No tienes eventos creados</p>
        <Button 
          color="primary" 
          onClick={() => window.location.href = '/crear'}
        >
          Crear mi primer evento
        </Button>
      </div>
    );
  }

  const handleEventUpdated = (updatedEvent: Event) => {
    toast.success('Evento actualizado exitosamente');
    refetch(); // Recargar la lista
  };

  const handleEventDeleted = (deletedEventId: string) => {
    toast.success('Evento eliminado exitosamente');
    refetch(); // Recargar la lista
  };

  const getEventStatus = (event: Event) => {
    const latestStatus = event.evento_estado?.[0]?.Estado;
    switch (latestStatus) {
      case 'ACTIVO':
        return { label: 'Activo', color: 'text-green-400 bg-green-500/20' };
      case 'OCULTO':
        return { label: 'Oculto', color: 'text-yellow-400 bg-yellow-500/20' };
      case 'CANCELADO':
        return { label: 'Cancelado', color: 'text-red-400 bg-red-500/20' };
      case 'COMPLETADO':
        return { label: 'Completado', color: 'text-blue-400 bg-blue-500/20' };
      case 'EDITADO':
        return { label: 'Editado', color: 'text-purple-400 bg-purple-500/20' };
      default:
        return { label: 'Desconocido', color: 'text-gray-400 bg-gray-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-100">Mis Eventos</h2>
        <Button 
          color="primary" 
          onClick={() => window.location.href = '/crear'}
        >
          Crear Nuevo Evento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const status = getEventStatus(event);
          const mainImage = event.imagenes_evento?.find(img => img.tipo === 'PORTADA');
          
          return (
            <Card key={event.eventoid} className="bg-stone-900/50 hover:bg-stone-900/70 transition-colors">
              <CardContent className="p-4">
                {/* Imagen del evento */}
                {mainImage && (
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <img 
                      src={mainImage.url} 
                      alt={event.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Estado del evento */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(event.fecha_creacion).toLocaleDateString()}
                  </span>
                </div>

                {/* Título */}
                <h3 className="text-lg font-semibold text-stone-100 mb-2 line-clamp-2">
                  {event.titulo}
                </h3>

                {/* Descripción */}
                {event.descripcion && (
                  <p className="text-sm text-stone-400 mb-3 line-clamp-2">
                    {event.descripcion}
                  </p>
                )}

                {/* Información adicional */}
                <div className="space-y-2 mb-4">
                  {event.ubicacion && (
                    <div className="flex items-center gap-2 text-sm text-stone-400">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{event.ubicacion}</span>
                    </div>
                  )}
                  
                  {event.fechas_evento && event.fechas_evento.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-stone-400">
                      <Calendar className="h-4 w-4" />
                      <span>{event.fechas_evento.length} fecha(s)</span>
                    </div>
                  )}

                  {event.stock_entrada && event.stock_entrada.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-stone-400">
                      <Users className="h-4 w-4" />
                      <span>{event.stock_entrada.length} tipo(s) de entrada</span>
                    </div>
                  )}
                </div>

                {/* Categorías */}
                {event.catevento && event.catevento.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.catevento.slice(0, 3).map((cat) => (
                      <span
                        key={cat.categoriaeventoid.toString()}
                        className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full"
                      >
                        {cat.categoriaevento.nombre}
                      </span>
                    ))}
                    {event.catevento.length > 3 && (
                      <span className="px-2 py-1 bg-stone-700 text-stone-400 text-xs rounded-full">
                        +{event.catevento.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="faded"
                    className="flex-1 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                    startContent={<Eye className="h-4 w-4" />}
                    onClick={() => window.open(`/evento/${event.eventoid}`, '_blank')}
                  >
                    Ver
                  </Button>
                  
                  <EditEventForm
                    event={event}
                    onEventUpdated={handleEventUpdated}
                    onEventDeleted={handleEventDeleted}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
