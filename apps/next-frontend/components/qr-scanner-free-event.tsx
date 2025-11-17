'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, QrCode, AlertCircle, Loader2, Search, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';
import { useFreeEventInscripciones, useValidateFreeEventQr } from '@/hooks/use-free-event-scanner';

interface Inscripcion {
  id: string;
  nombre: string;
  correo: string;
  fecha_inscripcion: string;
  codigoQR: string | null;
  validado: boolean;
  fecha_validacion: string | null;
}

interface ScannerFreeEventProps {
  eventoid: string;
}

// Component for camera QR scanning modal
interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

function CameraScannerModal({ isOpen, onClose, onScan }: CameraScannerModalProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const startScanning = async () => {
      try {
        setError(null);
        if (!videoRef.current) return;

        // Create Html5Qrcode instance
        const qrcodeInstance = new Html5Qrcode('qr-video-container-free');

        html5QrcodeRef.current = qrcodeInstance;

        // Start scanning
        await qrcodeInstance.start(
          { facingMode: 'environment' }, // Use back camera on mobile
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // On successful scan
            onScan(decodedText);
            stopScanning();
          },
          (error) => {
            // Errors are expected during scanning, we can ignore them
            // Only log critical errors
            if (!String(error).includes('NotFoundException')) {
              console.debug('QR Scan error:', error);
            }
          },
        );

        setIsScanning(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al acceder a la cámara';
        setError(errorMessage);
        console.error('Camera error:', err);
      }
    };

    startScanning();

    return () => {
      stopScanning();
    };
  }, [isOpen, onScan]);

  const stopScanning = async () => {
    try {
      if (html5QrcodeRef.current && isScanning) {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current = null;
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-stone-900 rounded-lg border border-stone-700 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <QrCode size={24} className="text-blue-500" />
            Escanear QR
          </h3>
          <button
            onClick={() => {
              onClose();
              stopScanning();
            }}
            className="text-stone-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Camera Container */}
        <div className="relative bg-black">
          {error ? (
            <div className="w-full aspect-square flex items-center justify-center">
              <div className="text-center p-4">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-red-400 font-semibold mb-2">{error}</p>
                <p className="text-stone-400 text-sm mb-4">
                  Asegúrate de permitir acceso a la cámara en tu navegador
                </p>
                <button
                  onClick={() => {
                    setError(null);
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div id="qr-video-container-free" className="w-full" ref={videoRef} />
          )}

          {/* Scanning overlay */}
          {isScanning && !error && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-1/4 border-2 border-blue-500 rounded-lg shadow-lg shadow-blue-500/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-16 bg-blue-500 rounded-full animate-pulse" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-700">
          <p className="text-stone-400 text-sm text-center">
            Apunta tu cámara al código QR para escanear
          </p>
        </div>
      </div>
    </div>
  );
}

export function QRScannerFreeEvent({ eventoid }: ScannerFreeEventProps) {
  const [manualCode, setManualCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingScanRef = useRef(false);
  const lastScanRef = useRef<{ code: string; timestamp: number } | null>(null);

  const {
    data: scannerData,
    isLoading: isScannerLoading,
    error: scannerError,
  } = useFreeEventInscripciones(eventoid);

  const validateQrMutation = useValidateFreeEventQr(eventoid);
  const scanning = validateQrMutation.isPending;

  const estadisticas = scannerData?.estadisticas ?? {
    totalInscritos: 0,
    validados: 0,
    pendientes: 0,
  };
  const inscripciones = scannerData?.inscripciones ?? [];
  const isInitialLoading = isScannerLoading && !scannerData;

  useEffect(() => {
    if (scannerError instanceof Error) {
      toast.error(scannerError.message);
    }
  }, [scannerError]);

  // Auto-focus en el input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleScan = async (codigo: string) => {
    const normalizedCode = codigo.trim().toLowerCase();
    if (!normalizedCode || isProcessingScanRef.current) {
      return;
    }

    const now = Date.now();
    const lastScan = lastScanRef.current;
    if (lastScan && lastScan.code === normalizedCode && now - lastScan.timestamp < 5000) {
      return;
    }
    lastScanRef.current = { code: normalizedCode, timestamp: now };

    isProcessingScanRef.current = true;

    setManualCode('');

    try {
      const data = await validateQrMutation.mutateAsync(normalizedCode);

      if (data?.data?.validado) {
        const esYaValidado = data.message?.includes('ya fue validado');

        if (esYaValidado) {
          toast.info(
            `⚠️ ${data.data.inscripcion.nombre} - Ya validado el ${new Date(data.data.fecha_validacion || '').toLocaleString('es-AR')}`,
          );
        } else {
          toast.success(`✓ ${data.data.inscripcion.nombre} - Entrada validada`);
        }
        setShowCameraModal(false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al validar código QR';
      toast.error(message);
      lastScanRef.current = { code: normalizedCode, timestamp: Date.now() }; // evitar reintentos instantáneos
    } finally {
      isProcessingScanRef.current = false;
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      lastScanRef.current = null;
      handleScan(manualCode);
    }
  };

  const filteredInscripciones = inscripciones.filter(
    (i) =>
      i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.correo.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const inscripcionesValidadas = filteredInscripciones.filter((i) => i.validado);
  const inscripcionesPendientes = filteredInscripciones.filter((i) => !i.validado);

  return (
    <div className="h-screen bg-gradient-to-br from-stone-900 to-stone-800 text-white p-3 md:p-6 lg:md:p-12 overflow-y-auto">
      <div className="max-w-full lg:max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <QrCode size={24} className="text-blue-500" />
            <h1 className="text-lg md:text-2xl lg:text-3xl font-bold">Scanner de Entradas</h1>
          </div>
          <p className="text-xs md:text-sm text-stone-400">
            Valida los códigos QR de los inscritos al evento gratuito
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-3 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-400 text-xs md:text-sm font-medium">TOTAL</span>
              <Users size={16} className="text-blue-500" />
            </div>
            <div className="text-2xl md:text-4xl font-bold">{estadisticas.totalInscritos}</div>
            <p className="text-stone-500 text-xs md:text-sm mt-1">Inscritos totales</p>
          </div>

          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-xs md:text-sm font-medium">VALIDADOS</span>
              <CheckCircle size={16} className="text-green-500" />
            </div>
            <div className="text-2xl md:text-4xl font-bold">{estadisticas.validados}</div>
            <p className="text-green-300/70 text-xs md:text-sm mt-1">Entrada confirmada</p>
          </div>

          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-400 text-xs md:text-sm font-medium">PENDIENTES</span>
              <AlertCircle size={16} className="text-orange-500" />
            </div>
            <div className="text-2xl md:text-4xl font-bold">{estadisticas.pendientes}</div>
            <p className="text-orange-300/70 text-xs md:text-sm mt-1">Por validar</p>
          </div>
        </div>

        {/* Scanner Input */}
        <div className="mb-4 rounded-lg border border-stone-700 bg-stone-800/50 p-2 md:p-3 lg:p-4">
          <form onSubmit={handleManualSubmit}>
            <label className="block text-xs md:text-sm font-medium text-stone-300 mb-2">
              Ingresa el código QR manualmente:
            </label>
            <div className="flex flex-col sm:flex-row gap-1 md:gap-2">
              <input
                ref={inputRef}
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Pega aquí el código QR..."
                disabled={scanning}
                className="flex-1 bg-stone-900 border border-stone-600 rounded-lg px-2 md:px-3 py-2 text-xs md:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowCameraModal(true)}
                disabled={scanning}
                className="px-2 md:px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-700 disabled:opacity-50 rounded-lg font-semibold text-xs md:text-sm transition-colors flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 8h-8" />
                  <path d="M6 4v6h6V4" />
                  <path d="M16 4v10h6V4" />
                </svg>
                <span className="hidden md:inline">Cámara</span>
              </button>
              <button
                type="submit"
                disabled={scanning || !manualCode.trim()}
                className="px-3 md:px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-700 disabled:opacity-50 rounded-lg font-semibold text-xs md:text-sm transition-colors flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap"
              >
                {scanning ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span className="hidden md:inline">Validando...</span>
                  </>
                ) : (
                  'Validar'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search and Filter */}
        <div className="mb-4 md:mb-6">
          <div className="relative">
            <Search
              className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-stone-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-800/50 border border-stone-700 rounded-lg pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 text-xs md:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Inscripciones List */}
        {isInitialLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Validados */}
            {inscripcionesValidadas.length > 0 && (
              <div>
                <h2 className="text-base md:text-lg font-semibold text-green-400 mb-2 md:mb-4 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Validados ({inscripcionesValidadas.length})
                </h2>
                <div className="space-y-2">
                  {inscripcionesValidadas.map((inscripcion) => (
                    <div
                      key={inscripcion.id}
                      className="rounded-lg border border-green-500/30 bg-green-500/10 p-2 md:p-3 lg:p-4 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-green-300 text-sm md:text-base truncate">
                          {inscripcion.nombre}
                        </p>
                        <p className="text-xs md:text-sm text-green-300/70 truncate">
                          {inscripcion.correo}
                        </p>
                        {inscripcion.fecha_validacion && (
                          <p className="text-xs text-green-300/50 mt-0.5">
                            Validado:{' '}
                            {new Date(inscripcion.fecha_validacion).toLocaleString('es-ES')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <CheckCircle size={18} className="text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pendientes */}
            {inscripcionesPendientes.length > 0 && (
              <div>
                <h2 className="text-base md:text-lg font-semibold text-orange-400 mb-2 md:mb-4 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Pendientes ({inscripcionesPendientes.length})
                </h2>
                <div className="space-y-2">
                  {inscripcionesPendientes.map((inscripcion) => (
                    <div
                      key={inscripcion.id}
                      className="rounded-lg border border-stone-700 bg-stone-800/50 p-2 md:p-3 lg:p-4 flex items-center justify-between gap-2 hover:border-orange-500/50 hover:bg-stone-800 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm md:text-base truncate">
                          {inscripcion.nombre}
                        </p>
                        <p className="text-xs md:text-sm text-stone-400 truncate">
                          {inscripcion.correo}
                        </p>
                        {inscripcion.codigoQR && (
                          <p className="text-xs text-stone-500 mt-0.5 font-mono truncate">
                            Código: {inscripcion.codigoQR.substring(0, 8)}...
                          </p>
                        )}
                      </div>
                      <AlertCircle size={18} className="text-orange-500 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredInscripciones.length === 0 && !isInitialLoading && (
              <div className="text-center py-8 md:py-12">
                <AlertCircle size={32} className="mx-auto text-stone-500 mb-2 md:mb-4" />
                <p className="text-xs md:text-sm text-stone-400">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay inscripciones'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <CameraScannerModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onScan={(code: string) => {
            handleScan(code);
            setShowCameraModal(false);
          }}
        />
      )}
    </div>
  );
}
