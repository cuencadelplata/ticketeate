'use client';

import { useEffect, useState } from 'react';
import { useQRScanner } from '@/hooks/useQRScanner';
import { useScannerStore } from '@/hooks/useScannerState';
import { X, Loader2, AlertCircle, Search, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface EventScannerProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Attendee {
  id: string;
  usuarioid: string;
  nombre: string;
  email: string;
  estado: string;
  scanned: number;
  remaining: number;
}

export function EventScanner({ eventId, isOpen, onClose }: EventScannerProps) {
  const { videoRef, canvasRef, isScanning, isSupported, startScanning, stopScanning } = useQRScanner({
    onSuccess: async (qrData) => {
      await validateTicket(qrData);
    },
    onError: (error) => {
      setError(`Error de cámara: ${error}`);
    },
    enabled: isOpen,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [stats, setStats] = useState({ total: 0, escaneados: 0, pendientes: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  // Load attendees
  useEffect(() => {
    if (isOpen) {
      fetchAttendees();
    }
  }, [isOpen, eventId]);

  // Start/stop scanning
  useEffect(() => {
    if (isOpen && isSupported) {
      startScanning();
    } else {
      stopScanning();
    }
    return () => stopScanning();
  }, [isOpen, isSupported, startScanning, stopScanning]);

  const fetchAttendees = async () => {
    try {
      const res = await fetch(`/api/eventos-asistentes-scanner?eventId=${eventId}`);
      if (!res.ok) throw new Error('Error al cargar asistentes');
      const data = await res.json();
      setAttendees(data.asistentes || []);
      setStats(data.stats || { total: 0, escaneados: 0, pendientes: 0 });
    } catch (err) {
      console.error('Error fetching attendees:', err);
      setError('Error al cargar asistentes');
    }
  };

  const validateTicket = async (qrCode: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/scanner-validate-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, qr_code: qrCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error validando entrada');
        return;
      }

      setSuccess(`✓ ${data.attendee_name}`);
      setTimeout(() => {
        setSuccess('');
        fetchAttendees();
      }, 2000);
    } catch (err) {
      setError('Error validando entrada');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendees = attendees.filter((a) =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b bg-slate-50 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">Escanear Entradas</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Scanner Video */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Cámara QR</label>
            <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {isScanning && (
                <div className="absolute inset-0 border-2 border-emerald-500 animate-pulse">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-emerald-500 opacity-50" />
                </div>
              )}

              {!isSupported && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <p className="text-white text-center">Cámara no disponible</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-emerald-700">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-600">Total Entradas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-xs text-slate-600">Escaneadas</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.escaneados}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-slate-600">Pendientes</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pendientes}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Attendees List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredAttendees.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No hay asistentes</p>
            ) : (
              filteredAttendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className={`p-3 rounded-lg border-2 transition ${
                    attendee.estado === 'ESCANEADO'
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{attendee.nombre}</p>
                      <p className="text-xs text-slate-500">{attendee.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {attendee.scanned}/{attendee.scanned + attendee.remaining}
                      </p>
                      <p className={`text-xs ${
                        attendee.estado === 'ESCANEADO'
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                      }`}>
                        {attendee.estado}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
