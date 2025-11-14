'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';
import jsQR from 'jsqr';

type Asistente = {
  id: string;
  usuarioid: string;
  nombre: string;
  email: string;
  entrada_id: string;
  codigo_qr: string;
  estado: string;
  fecha_escaneo?: string;
};

type EventoStats = {
  total: number;
  escaneados: number;
  pendientes: number;
};

export default function ScannerPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [asistentes, setAsistentes] = useState<Asistente[]>([]);
  const [stats, setStats] = useState<EventoStats>({ total: 0, escaneados: 0, pendientes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [scanMessage, setScanMessage] = useState<string>('');
  const [scanSuccess, setScanSuccess] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/sign-in?redirect_url=/evento/manage/${eventId}/scanner`);
      return;
    }

    if (session?.user && (session.user.role === 'ORGANIZADOR' || session.user.role === 'COLABORADOR')) {
      cargarAsistentes();
    } else if (session?.user) {
      router.push('/');
    }
  }, [session, isPending, eventId, router]);

  const cargarAsistentes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/eventos-asistentes?eventId=${eventId}`);

      if (!response.ok) {
        throw new Error('Error al cargar asistentes');
      }

      const data = await response.json();
      setAsistentes(data.asistentes || []);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScannerOpen(true);
        iniciarDeteccionQR();
      }
    } catch (err) {
      setError('No se puede acceder a la cámara');
      console.error('Error accediendo cámara:', err);
    }
  };

  const detenerCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsScannerOpen(false);
    setScanMessage('');
    setScanSuccess(null);
  };

  const iniciarDeteccionQR = () => {
    scanIntervalRef.current = setInterval(async () => {
      if (canvasRef.current && videoRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;

          context.drawImage(videoRef.current, 0, 0);
          const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            await procesarQR(code.data);
          }
        }
      }
    }, 300);
  };

  const procesarQR = async (qrCode: string) => {
    try {
      detenerCamera();

      const response = await fetch(`/api/eventos-validar-entrada?eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_qr: qrCode }),
      });

      if (response.ok) {
        setScanSuccess(true);
        setScanMessage('✓ Entrada escaneada correctamente');
        cargarAsistentes();
        setTimeout(() => {
          setScanMessage('');
          setScanSuccess(null);
          iniciarCamera();
        }, 2000);
      } else {
        setScanSuccess(false);
        setScanMessage('✗ QR no válido o entrada ya escaneada');
        setTimeout(() => {
          setScanMessage('');
          setScanSuccess(null);
          iniciarCamera();
        }, 3000);
      }
    } catch (err) {
      console.error('Error validando QR:', err);
      setScanSuccess(false);
      setScanMessage('Error al validar QR');
      setTimeout(() => {
        setScanMessage('');
        setScanSuccess(null);
        iniciarCamera();
      }, 3000);
    }
  };

  const filtrados = asistentes.filter(
    (a) =>
      a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const porcentajeEscaneados =
    stats.total > 0 ? Math.round((stats.escaneados / stats.total) * 100) : 0;

  if (!session?.user || (session.user.role !== 'ORGANIZADOR' && session.user.role !== 'COLABORADOR')) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-400 text-xl">No tienes permiso para acceder a esta página</div>
      </div>
    );
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-4xl font-bold mb-2">Escanear Entradas</h1>
          <p className="text-gray-400">Gestiona los asistentes del evento</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 text-red-300">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Total de Asistentes</p>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-green-900/20 rounded-lg p-6 border border-green-700">
            <p className="text-gray-400 text-sm mb-2">Escaneados</p>
            <p className="text-3xl font-bold text-green-400">{stats.escaneados}</p>
          </div>
          <div className="bg-yellow-900/20 rounded-lg p-6 border border-yellow-700">
            <p className="text-gray-400 text-sm mb-2">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.pendientes}</p>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-700">
            <p className="text-gray-400 text-sm mb-2">Progreso</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-blue-400">{porcentajeEscaneados}%</p>
            </div>
          </div>
        </div>

        {/* Scanner Button */}
        <div className="mb-8">
          <button
            onClick={isScannerOpen ? detenerCamera : iniciarCamera}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isScannerOpen
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isScannerOpen ? '⊘ Detener Escáner' : '📷 Abrir Escáner de Cámara'}
          </button>
        </div>

        {/* Camera View */}
        {isScannerOpen && (
          <div className="mb-8 bg-gray-900 rounded-lg overflow-hidden border border-gray-800 p-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-96 object-cover bg-black rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Overlay del escáner */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 border-2 border-blue-500 rounded-lg" />
              </div>

              {scanMessage && (
                <div
                  className={`absolute top-0 left-0 right-0 p-4 text-center font-semibold ${
                    scanSuccess ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {scanMessage}
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm mt-4 text-center">Apunta a los códigos QR para escanear</p>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <svg
              className="absolute left-4 top-4 w-5 h-5 text-gray-500"
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
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Asistentes Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Fecha de Escaneo</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      {searchTerm ? 'No se encontraron asistentes' : 'No hay asistentes aún'}
                    </td>
                  </tr>
                ) : (
                  filtrados.map((asistente) => (
                    <tr
                      key={asistente.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-white">{asistente.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{asistente.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            asistente.estado === 'ESCANEADO'
                              ? 'bg-green-900/30 text-green-400 border border-green-700'
                              : 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                          }`}
                        >
                          {asistente.estado === 'ESCANEADO' ? '✓ Escaneado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {asistente.fecha_escaneo ? new Date(asistente.fecha_escaneo).toLocaleString('es-ES') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            💡 Solo organizadores y colaboradores pueden acceder a esta página. El escáner captura códigos QR
            de las entradas para validar asistencia.
          </p>
        </div>
      </div>
    </div>
  );
}
