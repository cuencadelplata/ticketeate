'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useQRScanner } from '@/hooks/useQRScanner';
import { useScannerStore } from '@/hooks/useScannerState';
import { SCANNER_MESSAGES } from '@/lib/scanner-config';
import { motion, AnimatePresence } from 'framer-motion';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidation?: (result: any) => void;
}

export function Scanner({ isOpen, onClose, onValidation }: ScannerModalProps) {
  const { videoRef, canvasRef, isScanning, isSupported, startScanning, stopScanning } =
    useQRScanner({
      onSuccess: (result) => {
        const scannerStore = useScannerStore.getState();
        scannerStore.setResult(result);
        onValidation?.(result);
      },
      onError: (error) => {
        const scannerStore = useScannerStore.getState();
        scannerStore.setError(error);
      },
      enabled: isOpen,
    });

  const { status, result, error } = useScannerStore();
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isOpen && isSupported) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, isSupported, startScanning, stopScanning]);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      setShowResult(true);
    }
  }, [status]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden z-[10000]"
        >
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Close scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Validar Entrada
            </h2>

            {!isSupported ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  Tu navegador no soporta acceso a la cámara
                </p>
              </div>
            ) : (
              <>
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-80 object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                  {isScanning && (
                    <div className="absolute inset-0 border-2 border-orange-500/50 pointer-events-none">
                      <div className="absolute inset-4 border border-dashed border-orange-400/30" />
                    </div>
                  )}
                </div>

                {isScanning && (
                  <div className="flex items-center justify-center gap-2 text-orange-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">{SCANNER_MESSAGES.SCANNING}</span>
                  </div>
                )}

                {showResult && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Ticket validado correctamente
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Scanner;
