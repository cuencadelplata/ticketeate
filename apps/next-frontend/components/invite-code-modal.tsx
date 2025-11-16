'use client';

import { Loader2 } from 'lucide-react';

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  codeValue: string;
  onCodeChange: (value: string) => void;
  isLoading: boolean;
}

export function InviteCodeModal({
  isOpen,
  onClose,
  onSubmit,
  codeValue,
  onCodeChange,
  isLoading,
}: InviteCodeModalProps) {
  if (!isOpen) return null;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && codeValue.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-stone-800 rounded-lg p-8 max-w-md w-full mx-4 border border-stone-700">
        <h2 className="text-2xl font-bold text-white mb-4">Ingresar Código de Invitación</h2>
        <p className="text-stone-400 mb-6">
          Ingresa el código que te proporcionó el organizador del evento
        </p>

        <input
          type="text"
          value={codeValue}
          onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          placeholder="Ej: ABC123DEF"
          maxLength={20}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-lg bg-stone-900 border border-stone-700 text-white placeholder-stone-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 mb-6 uppercase"
          autoFocus
        />

        <div className="flex gap-3">
          <button
            onClick={onSubmit}
            disabled={isLoading || !codeValue.trim()}
            className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Validando...
              </span>
            ) : (
              'Validar Código'
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-stone-700 hover:bg-stone-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
