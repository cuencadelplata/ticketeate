'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUpdateEvent, useDeleteEvent } from '@/hooks/use-events';
import { useAuth } from '@clerk/nextjs';
import type { Event, CreateEventData } from '@/types/events';
import { Button } from '@heroui/react';
import { Trash, Edit, Save, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface EditEventFormProps {
  event: Event;
  onEventUpdated?: (updatedEvent: Event) => void;
  onEventDeleted?: (deletedEventId: string) => void;
}

export default function EditEventForm({ 
  event, 
  onEventUpdated, 
  onEventDeleted 
}: EditEventFormProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados del formulario
  const [eventName, setEventName] = useState(event.titulo);
  const [description, setDescription] = useState(event.descripcion || '');
  const [location, setLocation] = useState(event.ubicacion);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    event.catevento?.map(cat => cat.categoriaevento.nombre) || []
  );
  
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  // Resetear formulario cuando se abre el diálogo
  useEffect(() => {
    if (isEditDialogOpen) {
      setEventName(event.titulo);
      setDescription(event.descripcion || '');
      setLocation(event.ubicacion);
      setSelectedCategories(event.catevento?.map(cat => cat.categoriaevento.nombre) || []);
    }
  }, [isEditDialogOpen, event]);

  const handleUpdateEvent = async () => {
    if (!isSignedIn) {
      toast.error('Debes iniciar sesión para editar eventos');
      return;
    }

    if (!eventName.trim()) {
      toast.error('Por favor ingresa un nombre para el evento');
      return;
    }

    if (!description.trim()) {
      toast.error('Por favor agrega una descripción del evento');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Por favor selecciona al menos una categoría para el evento');
      return;
    }

    const eventData: Partial<CreateEventData> = {
      titulo: eventName,
      descripcion: description,
      ubicacion: location,
      categorias: selectedCategories.map(categoryName => ({ nombre: categoryName })),
      estado: 'ACTIVO', // Mantener como activo al editar
    };

    updateEventMutation.mutate(
      { id: event.eventoid, eventData },
      {
        onSuccess: (updatedEvent) => {
          toast.success('¡Evento actualizado exitosamente!', {
            description: `${updatedEvent.titulo} ha sido actualizado.`,
          });
          setIsEditDialogOpen(false);
          setIsEditing(false);
          onEventUpdated?.(updatedEvent);
        },
        onError: (error) => {
          toast.error(error.message || 'Error al actualizar el evento');
        },
      }
    );
  };

  const handleDeleteEvent = async () => {
    if (!isSignedIn) {
      toast.error('Debes iniciar sesión para eliminar eventos');
      return;
    }

    deleteEventMutation.mutate(event.eventoid, {
      onSuccess: () => {
        toast.success('Evento eliminado exitosamente');
        setIsDeleteDialogOpen(false);
        onEventDeleted?.(event.eventoid);
      },
      onError: (error) => {
        toast.error(error.message || 'Error al eliminar el evento');
      },
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Resetear valores
    setEventName(event.titulo);
    setDescription(event.descripcion || '');
    setLocation(event.ubicacion);
    setSelectedCategories(event.catevento?.map(cat => cat.categoriaevento.nombre) || []);
  };

  return (
    <div className="flex gap-2">
      {/* Botón de Editar */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="faded"
            className="bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
            startContent={<Edit className="h-4 w-4" />}
          >
            Editar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Evento: {event.titulo}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Nombre del evento */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-200">
                Nombre del evento
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-stone-100 focus:border-orange-500 focus:outline-none"
                placeholder="Nombre del evento"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-200">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-stone-100 focus:border-orange-500 focus:outline-none"
                placeholder="Descripción del evento"
                rows={4}
              />
            </div>

            {/* Ubicación */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-200">
                Ubicación
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-stone-600 bg-stone-800 px-3 py-2 text-stone-100 focus:border-orange-500 focus:outline-none"
                placeholder="Ubicación del evento"
              />
            </div>

            {/* Categorías */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-200">
                Categorías
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((categoryName) => (
                  <div
                    key={categoryName}
                    className="flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1 text-sm text-orange-300"
                  >
                    <span>{categoryName}</span>
                    <button
                      onClick={() => {
                        setSelectedCategories(prev => 
                          prev.filter(cat => cat !== categoryName)
                        );
                      }}
                      className="ml-1 rounded-full hover:bg-orange-500/30 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              {selectedCategories.length === 0 && (
                <p className="text-xs text-red-400">
                  ⚠️ Debes seleccionar al menos una categoría
                </p>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="faded"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateEventMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                onClick={handleUpdateEvent}
                disabled={updateEventMutation.isPending}
                startContent={<Save className="h-4 w-4" />}
              >
                {updateEventMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botón de Eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="faded"
            className="bg-red-500/20 text-red-300 hover:bg-red-500/30"
            startContent={<Trash className="h-4 w-4" />}
          >
            Eliminar
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar evento?</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-stone-300 mb-4">
              ¿Estás seguro de que quieres eliminar el evento "{event.titulo}"?
              Esta acción no se puede deshacer.
            </p>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="faded"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteEventMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                color="danger"
                onClick={handleDeleteEvent}
                disabled={deleteEventMutation.isPending}
                startContent={<Trash className="h-4 w-4" />}
              >
                {deleteEventMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
