'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, QrCode, AlertCircle, Loader2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

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

export function QRScannerFreeEvent({ eventoid }: ScannerFreeEventProps) {
  const [manualCode, setManualCode] = useState('');
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [estadisticas, setEstadisticas] = useState({
    totalInscritos: 0,
    validados: 0,
    pendientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar inscripciones al montar
  useEffect(() => {
    loadInscripciones();
  }, [eventoid]);

  // Auto-focus en el input
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const loadInscripciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/validar-qr?eventId=${eventoid}`);

      if (!response.ok) {
        toast.error('Error al cargar inscripciones');
        return;
      }

      const data = await response.json();
      setInscripciones(data.data.inscripciones);
      setEstadisticas(data.data.estadisticas);
    } catch (error) {
      toast.error('Error al cargar inscripciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (codigo: string) => {
    if (!codigo.trim()) return;

    setLastScanned(codigo);
    setManualCode('');
    setScanning(true);

    try {
      const response = await fetch('/api/validar-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventoid,
          codigo: codigo.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Error al validar código');
      } else {
        if (data.data.validado) {
          toast.success(`✓ ${data.data.inscripcion.nombre} - Entrada validada`);
        }
        // Recargar la lista
        await loadInscripciones();
      }
    } catch (error) {
      toast.error('Error al validar código QR');
      console.error(error);
    } finally {
      setScanning(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
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
    <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 md:p-12 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <QrCode size={32} className="text-blue-500" />
            <h1 className="text-3xl font-bold">Scanner de Inscripciones</h1>
          </div>
          <p className="text-stone-400">
            Valida los códigos QR de los inscritos al evento gratuito
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border border-stone-700 bg-stone-800/50 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-stone-400 text-sm font-medium">TOTAL</span>
              <Users size={20} className="text-blue-500" />
            </div>
            <div className="text-4xl font-bold">{estadisticas.totalInscritos}</div>
            <p className="text-stone-500 text-sm mt-2">Inscritos totales</p>
          </div>

          <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-medium">VALIDADOS</span>
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <div className="text-4xl font-bold">{estadisticas.validados}</div>
            <p className="text-green-300/70 text-sm mt-2">Entrada confirmada</p>
          </div>

          <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-400 text-sm font-medium">PENDIENTES</span>
              <AlertCircle size={20} className="text-orange-500" />
            </div>
            <div className="text-4xl font-bold">{estadisticas.pendientes}</div>
            <p className="text-orange-300/70 text-sm mt-2">Por validar</p>
          </div>
        </div>

        {/* Scanner Input */}
        <div className="mb-8 rounded-lg border border-stone-700 bg-stone-800/50 p-6">
          <form onSubmit={handleManualSubmit}>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Ingresa el código QR manualmente:
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Pega aquí el código QR..."
                disabled={scanning}
                className="flex-1 bg-stone-900 border border-stone-600 rounded-lg px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={scanning || !manualCode.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-700 disabled:opacity-50 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {scanning ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Validando...
                  </>
                ) : (
                  'Validar'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-stone-800/50 border border-stone-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Inscripciones List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Validados */}
            {inscripcionesValidadas.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Validados ({inscripcionesValidadas.length})
                </h2>
                <div className="space-y-2">
                  {inscripcionesValidadas.map((inscripcion) => (
                    <div
                      key={inscripcion.id}
                      className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-green-300">{inscripcion.nombre}</p>
                        <p className="text-sm text-green-300/70">{inscripcion.correo}</p>
                        {inscripcion.fecha_validacion && (
                          <p className="text-xs text-green-300/50 mt-1">
                            Validado:{' '}
                            {new Date(inscripcion.fecha_validacion).toLocaleString('es-ES')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={24} className="text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pendientes */}
            {inscripcionesPendientes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
                  <AlertCircle size={20} />
                  Pendientes ({inscripcionesPendientes.length})
                </h2>
                <div className="space-y-2">
                  {inscripcionesPendientes.map((inscripcion) => (
                    <div
                      key={inscripcion.id}
                      className="rounded-lg border border-stone-700 bg-stone-800/50 p-4 flex items-center justify-between hover:border-orange-500/50 hover:bg-stone-800 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-white">{inscripcion.nombre}</p>
                        <p className="text-sm text-stone-400">{inscripcion.correo}</p>
                        {inscripcion.codigoQR && (
                          <p className="text-xs text-stone-500 mt-1 font-mono">
                            Código: {inscripcion.codigoQR.substring(0, 8)}...
                          </p>
                        )}
                      </div>
                      <AlertCircle size={24} className="text-orange-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredInscripciones.length === 0 && !loading && (
              <div className="text-center py-12">
                <AlertCircle size={48} className="mx-auto text-stone-500 mb-4" />
                <p className="text-stone-400">
                  {searchTerm ? 'No se encontraron resultados' : 'No hay inscripciones'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
