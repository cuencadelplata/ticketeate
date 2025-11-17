'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  CheckCircle,
  Clock,
  QrCode,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';
import {
  useGetTicketStats,
  useScanTicket,
  useGetScannedTickets,
  useGetEventInfo,
  useGetUnscanedTickets,
} from '@/hooks/use-scanner';

interface ScannerProps {
  eventoid: string;
}

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

// Component for camera QR scanning modal
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
        const qrcodeInstance = new Html5Qrcode('qr-video-container', {
          experimentalFeatures: {
            useBarcoderEngine: false,
          },
        });

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
            <QrCode size={24} className="text-orange-500" />
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
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div id="qr-video-container" className="w-full" ref={videoRef} />
          )}

          {/* Scanning overlay */}
          {isScanning && !error && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-1/4 border-2 border-orange-500 rounded-lg shadow-lg shadow-orange-500/50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-16 bg-orange-500 rounded-full animate-pulse" />
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

// Componente para manejar escaneo con cámara (usando un input de tipo file para captura de QR)
export function QRScanner({ eventoid }: ScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: stats,
    refetch: refetchStats,
    isLoading: loadingStats,
  } = useGetTicketStats(eventoid);
  const { mutate: scanTicket, isPending: scanning } = useScanTicket();
  const { data: scannedTickets, refetch: refetchScanned } = useGetScannedTickets(eventoid);
  const { data: unscanedTickets } = useGetUnscanedTickets(eventoid);
  const { data: eventInfo, isLoading: loadingEvent } = useGetEventInfo(eventoid);

  useEffect(() => {
    // Auto-focus en el input para que escanee automáticamente
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleScan = (code: string) => {
    if (!code.trim()) return;

    setLastScanned(code);
    setManualCode('');

    scanTicket(
      { eventoid, codigoQr: code },
      {
        onSuccess: (result) => {
          toast.success(result.message || 'Ticket escaneado correctamente');
          refetchStats();
          refetchScanned();
          if (inputRef.current) {
            inputRef.current.focus();
          }
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Error al escanear');
          if (inputRef.current) {
            inputRef.current.focus();
          }
        },
      },
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <QrCode size={32} className="text-orange-500" />
            <h1 className="text-3xl font-bold">Scanner de Entradas</h1>
          </div>
          <p className="text-stone-400">Escanea códigos QR para validar entradas</p>
        </div>

        {/* Evento Info */}
        {loadingEvent ? (
          <div className="mb-8 rounded-lg border border-stone-700 bg-stone-800/50 p-6">
            <Loader2 size={24} className="animate-spin text-orange-500" />
          </div>
        ) : eventInfo ? (
          <div className="mb-8 rounded-lg border border-orange-500/30 bg-orange-500/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">{eventInfo.titulo}</h2>
            <div className="space-y-2 text-orange-100">
              {eventInfo.fechas_evento && eventInfo.fechas_evento.length > 0 && (
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-orange-400" />
                  <span>
                    {new Date(eventInfo.fechas_evento[0].fecha_hora).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
              {eventInfo.ubicacion && (
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-orange-400" />
                  <span>{eventInfo.ubicacion}</span>
                </div>
              )}
              {eventInfo.descripcion && (
                <p className="text-sm pt-2 text-orange-200">{eventInfo.descripcion}</p>
              )}
            </div>
          </div>
        ) : null}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {loadingStats ? (
            <div className="md:col-span-3 flex items-center justify-center py-8">
              <Loader2 size={32} className="animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              {/* Total */}
              <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-stone-400 text-sm font-medium">TOTAL</span>
                  <BarChart3 size={20} className="text-orange-500" />
                </div>
                <div className="text-4xl font-bold">{stats?.totalTickets || 0}</div>
                <p className="text-stone-500 text-sm mt-2">Entradas totales</p>
              </div>

              {/* Escaneados */}
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 text-sm font-medium">ESCANEADOS</span>
                  <CheckCircle size={20} className="text-green-500" />
                </div>
                <div className="text-4xl font-bold text-green-400">
                  {stats?.scannedTickets || 0}
                </div>
                <p className="text-green-400/60 text-sm mt-2">
                  {stats?.percentage || 0}% completado
                </p>
              </div>

              {/* Por Escanear */}
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 text-sm font-medium">POR ESCANEAR</span>
                  <Clock size={20} className="text-orange-500" />
                </div>
                <div className="text-4xl font-bold text-orange-400">
                  {stats?.pendingTickets || 0}
                </div>
                <p className="text-orange-400/60 text-sm mt-2">Entradas pendientes</p>
              </div>
            </>
          )}
        </div>

        {/* Progress Bar */}
        {stats && (
          <div className="mb-8 rounded-lg border border-stone-700 bg-stone-800/50 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-300 font-medium">Progreso</span>
              <span className="text-orange-400 font-semibold">{stats.percentage}%</span>
            </div>
            <div className="w-full h-3 bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Scanner Input */}
        <div className="mb-8 rounded-lg border border-stone-700 bg-stone-800/50 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <QrCode size={24} className="text-orange-500" />
            Escanear Entrada
          </h2>

          {/* Hidden input for barcode scanner */}
          <input
            ref={inputRef}
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleManualSubmit(e as any);
              }
            }}
            placeholder="Escanea un código QR o ingresa manualmente"
            className="w-full rounded-lg border border-stone-600 bg-stone-900 px-4 py-3 text-white placeholder-stone-500 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 mb-4"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setShowCameraModal(true)}
              disabled={scanning}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-700 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
              Abrir Cámara
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={scanning || !manualCode.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-700 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
            >
              {scanning ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <QrCode size={20} />
                  Validar
                </>
              )}
            </button>
          </div>

          {lastScanned && (
            <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-green-400 text-sm">
                <CheckCircle size={16} className="inline mr-2" />
                Último código escaneado: <span className="font-mono font-bold">{lastScanned}</span>
              </p>
            </div>
          )}
        </div>

        {/* Últimas Entradas Escaneadas */}
        <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={24} className="text-blue-500" />
              Inscritos al Evento
            </h2>

            {/* Search Bar */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-stone-900 border border-stone-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          {!scannedTickets || !unscanedTickets ? (
            <div className="text-center py-8">
              <Loader2 size={32} className="animate-spin text-orange-500 mx-auto" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Validados */}
              {scannedTickets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Validados ({scannedTickets.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {scannedTickets
                      .filter(
                        (t) =>
                          !searchTerm ||
                          t.usuario?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((ticket) => (
                        <div
                          key={ticket.entradaid}
                          className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-green-300">
                              {ticket.usuario?.name || 'Usuario desconocido'}
                            </p>
                            <p className="text-sm text-green-300/70">
                              {ticket.usuario?.email || ticket.codigo_qr}
                            </p>
                          </div>
                          <CheckCircle size={20} className="text-green-500" />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Pendientes */}
              {unscanedTickets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} />
                    Pendientes ({unscanedTickets.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {unscanedTickets
                      .filter(
                        (t) =>
                          !searchTerm ||
                          t.usuario?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((ticket) => (
                        <div
                          key={ticket.entradaid}
                          className="rounded-lg border border-stone-700 bg-stone-800/50 p-3 flex items-center justify-between hover:border-orange-500/50"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-white">
                              {ticket.usuario?.name || 'Usuario desconocido'}
                            </p>
                            <p className="text-sm text-stone-400">
                              {ticket.usuario?.email || ticket.codigo_qr}
                            </p>
                          </div>
                          <AlertCircle size={20} className="text-orange-500" />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {scannedTickets.length === 0 && unscanedTickets.length === 0 && (
                <div className="text-center py-8 text-stone-400">
                  <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Sin inscritos aún</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-blue-300 text-sm">
          <p>
            💡 <strong>Consejo:</strong> Mantenga enfocado el campo de escaneo. Los códigos se
            procesarán automáticamente al escanearlos.
          </p>
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
    </div>
  );
}
