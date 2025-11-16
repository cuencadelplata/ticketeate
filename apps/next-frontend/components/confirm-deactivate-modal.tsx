'use client';

import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDeactivateModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeactivateModal({
  isOpen,
  title = 'Confirmar desactivación',
  description = '¿Estás seguro de que deseas desactivar este elemento?',
  itemName,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmDeactivateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-stone-800 rounded-lg p-8 max-w-md w-full mx-4 border border-red-500/30">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-stone-400">
              {description}
              {itemName && <span className="block mt-2 text-yellow-400 font-medium">{itemName}</span>}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-stone-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Desactivando...
              </>
            ) : (
              'Desactivar'
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-stone-700 hover:bg-stone-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
