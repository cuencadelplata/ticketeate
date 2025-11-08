'use client';

import { useState, useEffect } from 'react';
import { Edit3, X, Save, Calendar, MapPin, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Event } from '@/types/events';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<Event>) => Promise<void>;
  event: Event | null;
  isLoading?: boolean;
}

export function EditEventModal({
  isOpen,
  onClose,
  onSave,
  event,
  isLoading = false,
}: EditEventModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    ubicacion: '',
    estado: 'OCULTO' as 'ACTIVO' | 'CANCELADO' | 'COMPLETADO' | 'OCULTO',
  });

  // Cargar datos del evento cuando se abre el modal
  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        titulo: event.titulo || '',
        descripcion: event.descripcion || '',
        ubicacion: event.ubicacion || '',
        estado: (event.evento_estado?.[0]?.Estado as any) || 'OCULTO',
      });
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    try {
      await onSave({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        ubicacion: formData.ubicacion,
        estado: formData.estado,
      });
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-2xl rounded-xl bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] border border-[#3A3A3A] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 border border-blue-500/50">
              <Edit3 className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Editar evento</h3>
              <p className="text-sm text-stone-400">Modifica los detalles del evento</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-[#3A3A3A] hover:text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="space-y-6">
            {/* Título */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                Título del evento *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                className="w-full rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] px-3 py-2 text-white placeholder-stone-400 focus:border-blue-500 focus:outline-none"
                placeholder="Nombre del evento"
                required
                disabled={isLoading}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                className="w-full rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] px-3 py-2 text-white placeholder-stone-400 focus:border-blue-500 focus:outline-none"
                placeholder="Describe tu evento..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                <MapPin className="inline h-4 w-4 mr-1" />
                Ubicación *
              </label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => setFormData((prev) => ({ ...prev, ubicacion: e.target.value }))}
                className="w-full rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] px-3 py-2 text-white placeholder-stone-400 focus:border-blue-500 focus:outline-none"
                placeholder="Dirección del evento"
                required
                disabled={isLoading}
              />
            </div>

            {/* Estado */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white">
                <Eye className="inline h-4 w-4 mr-1" />
                Estado del evento
              </label>
              <select
                value={formData.estado}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, estado: e.target.value as any }))
                }
                className="w-full rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                disabled={isLoading}
              >
                <option value="OCULTO">Oculto</option>
                <option value="ACTIVO">Activo</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="COMPLETADO">Completado</option>
              </select>
              <p className="mt-1 text-xs text-stone-400">
                {formData.estado === 'OCULTO' && 'El evento no será visible para los usuarios'}
                {formData.estado === 'ACTIVO' && 'El evento será visible y disponible para compras'}
                {formData.estado === 'CANCELADO' && 'El evento ha sido cancelado'}
                {formData.estado === 'COMPLETADO' && 'El evento ha terminado'}
              </p>
            </div>

            {/* Información adicional */}
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
              <div className="flex items-center gap-2 text-sm text-blue-200 mb-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Información adicional</span>
              </div>
              <div className="text-xs text-blue-300 space-y-1">
                <p>• Las fechas del evento se pueden modificar en la página de gestión</p>
                <p>• Las imágenes se pueden actualizar desde la página de gestión</p>
                <p>• Los tipos de entrada se gestionan en la página de gestión</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-[#3A3A3A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4A4A4A] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.titulo.trim() || !formData.ubicacion.trim()}
              className={cn(
                'flex items-center justify-center gap-2 flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors',
                isLoading || !formData.titulo.trim() || !formData.ubicacion.trim()
                  ? 'bg-blue-500/50 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600',
              )}
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
