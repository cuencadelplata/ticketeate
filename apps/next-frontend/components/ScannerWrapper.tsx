'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ScannerWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onValidation?: (result: any) => void;
}

export function ScannerWrapper({ isOpen, onClose, onValidation }: ScannerWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !isMounted) return;

    const startCamera = async () => {
      try {
        setError(null);
        if (!navigator.mediaDevices?.getUserMedia) {
          setError('Tu navegador no soporta acceso a cámara');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('No se pudo acceder a la cámara. Verifica los permisos.');
        console.error('Camera error:', err);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, isMounted]);

  const handleCapture = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    try {
      setLoading(true);
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx.drawImage(videoRef.current, 0, 0);

      const response = await fetch('/api/scanner-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: Math.random().toString(36).substring(7),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onValidation?.(result);
        onClose();
      } else {
        setError('QR inválido o no encontrado');
      }
    } catch (err) {
      setError('Error al escanear. Intenta nuevamente.');
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !isMounted) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] pointer-events-auto"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden relative z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
          <h2 className="text-white font-semibold">Escanear Entrada</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative bg-black rounded-lg overflow-hidden mb-4 aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-2 border-blue-500 opacity-30 pointer-events-none" />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleCapture}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Escaneando...
                </>
              ) : (
                'Capturar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
