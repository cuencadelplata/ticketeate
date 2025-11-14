'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';
import jsQR from 'jsqr';

type AttendeeRecord = {
  id: string;
  usuarioid: string;
  nombre: string;
  email: string;
  entradas_total: number;
  entradas_escaneadas: number;
  fecha_compra: string;
};

type ScanResult = {
  success: boolean;
  message: string;
  data?: AttendeeRecord;
};

export default function EventScannerPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [attendees, setAttendees] = useState<AttendeeRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [scanMessage, setScanMessage] = useState<string>('');
  const [scanSuccess, setScanSuccess] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!isPending && !session) {
      router.push(`/sign-in?redirect_url=/evento/manage/${eventId}/scanner`);
      return;
    }

    if (session?.user?.role !== 'ORGANIZADOR' && session?.user?.role !== 'COLABORADOR') {
      router.push('/');
      return;
    }

    cargarAsistentes();
  }, [session, isPending, eventId, router, isMounted]);

  const cargarAsistentes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/eventos/${eventId}/asistentes?usuario_id=${session?.user?.id}`,
      );

      if (!response.ok) {
        throw new Error('No tienes acceso a este evento');
      }

      const data = await response.json();
      setAttendees(data.asistentes || []);
    } catch (err) {
      console.error('Error cargando asistentes:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const iniciarScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScannerActive(true);
        iniciarDeteccionQR();
      }
    } catch (err) {
      console.error('Error accediendo a la cámara:', err);
      setError('No se pudo acceder a la cámara');
    }
  };

  const detenerScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }

    setIsScannerActive(false);
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
          const imageData = context.getImageData(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );

          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            await procesarQR(code.data);
          }
        }
      }
    }, 300);
  };

  const procesarQR = async (qrData: string) => {
    try {
      detenerScanner();

      const response = await fetch(`/api/eventos/${eventId}/validar-entrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_data: qrData,
          usuario_id: session?.user?.id,
        }),
      });

      const result: ScanResult = await response.json();

      if (result.success && result.data) {
        setScanSuccess(true);
        setScanMessage(`✓ ${result.data.nombre} - Entrada escaneada`);
        setAttendees((prev) =>
          prev.map((a) =>
            a.id === result.data?.id
              ? { ...a, entradas_escaneadas: a.entradas_escaneadas + 1 }
              : a,
          ),
        );

        setTimeout(() => {
          setScanMessage('');
          setScanSuccess(null);
          iniciarScanner();
        }, 2000);
      } else {
        setScanSuccess(false);
        setScanMessage(result.message || 'No se pudo validar la entrada');
        setTimeout(() => {
          setScanMessage('');
          setScanSuccess(null);
          iniciarScanner();
        }, 3000);
      }
    } catch (err) {
      console.error('Error procesando QR:', err);
      setScanSuccess(false);
      setScanMessage('Error al procesar el código');
      setTimeout(() => {
        setScanMessage('');
        setScanSuccess(null);
        iniciarScanner();
      }, 3000);
    }
  };

  const filteredAttendees = attendees.filter((a) =>
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const stats = {
    total: attendees.reduce((sum, a) => sum + a.entradas_total, 0),
    escaneadas: attendees.reduce((sum, a) => sum + a.entradas_escaneadas, 0),
  };

  stats.restantes = stats.total - stats.escaneadas;

  if (!isMounted || isPending || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Cargando evento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold mb-2">Escanear Entradas</h1>
          <p className="text-gray-400">Escanea códigos QR para registrar asistentes</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">Total de Entradas</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-green-900 rounded-lg p-6 border border-green-800">
            <p className="text-green-400 text-sm mb-2">Escaneadas</p>
            <p className="text-3xl font-bold text-green-300">{stats.escaneadas}</p>
          </div>
          <div className="bg-yellow-900 rounded-lg p-6 border border-yellow-800">
            <p className="text-yellow-400 text-sm mb-2">Restantes</p>
            <p className="text-3xl font-bold text-yellow-300">{stats.restantes}</p>
          </div>
        </div>

        {/* Scanner */}
        <div className="mb-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
          {!isScannerActive ? (
            <button
              onClick={iniciarScanner}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Iniciar Escáner
            </button>
          ) : (
            <div>
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-80 object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay del escáner */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-blue-500 rounded-lg" />
                </div>

                {scanMessage && (
                  <div
                    className={`absolute top-0 left-0 right-0 p-4 text-center font-semibold ${
                      scanSuccess
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {scanMessage}
                  </div>
                )}
              </div>

              <button
                onClick={detenerScanner}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Detener Escáner
              </button>
            </div>
          )}
        </div>

        {/* Búsqueda */}
        <div className="mb-8">
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

        {/* Lista de Asistentes */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          {filteredAttendees.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {searchTerm ? 'No se encontraron resultados' : 'No hay asistentes registrados'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-800">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Nombre</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Total</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Escaneadas</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Restantes</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Compra</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((attendee, idx) => (
                    <tr
                      key={attendee.id}
                      className={`border-b border-gray-800 ${idx % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900'}`}
                    >
                      <td className="px-6 py-4 text-sm text-white">{attendee.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{attendee.email}</td>
                      <td className="px-6 py-4 text-center text-sm text-white font-medium">
                        {attendee.entradas_total}
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span className="bg-green-900 text-green-300 px-3 py-1 rounded-full text-xs font-medium">
                          {attendee.entradas_escaneadas}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            attendee.entradas_total - attendee.entradas_escaneadas === 0
                              ? 'bg-blue-900 text-blue-300'
                              : 'bg-yellow-900 text-yellow-300'
                          }`}
                        >
                          {attendee.entradas_total - attendee.entradas_escaneadas}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(attendee.fecha_compra).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
