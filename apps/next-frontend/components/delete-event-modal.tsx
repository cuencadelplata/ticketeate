'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventTitle: string;
  isLoading?: boolean;
}

export function DeleteEventModal({
  isOpen,
  onClose,
  onConfirm,
  eventTitle,
  isLoading = false,
}: DeleteEventModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md rounded-xl bg-gradient-to-br from-[#1E1E1E] to-[#2A2A2A] border border-[#3A3A3A] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 border border-red-500/50">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Eliminar evento</h3>
              <p className="text-sm text-stone-400">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-[#3A3A3A] hover:text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="mb-6 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
            <p className="text-sm text-yellow-200">
              ¿Estás seguro de que quieres eliminar el evento{' '}
              <span className="font-semibold text-white">"{eventTitle}"</span>?
            </p>
            <p className="mt-2 text-xs text-yellow-300">
              El evento será marcado como cancelado y ya no será visible para los usuarios. Esta
              acción se puede revertir cambiando el estado del evento.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-[#3A3A3A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4A4A4A] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors',
                isLoading ? 'bg-red-500/50 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600',
              )}
            >
              {isLoading ? 'Eliminando...' : 'Eliminar evento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
