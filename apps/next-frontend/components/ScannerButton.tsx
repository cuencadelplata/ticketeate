'use client';

import { QrCode } from 'lucide-react';

interface ScannerButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isScanning?: boolean;
}

export function ScannerButton({ onClick, disabled, isScanning }: ScannerButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
    >
      <QrCode className="w-5 h-5" />
      {isScanning ? 'Escaneando...' : 'Validar Entrada'}
    </button>
  );
}
