'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';

type Attendee = {
  id: string;
  name: string;
  email: string;
  ticketQR: string;
  status: 'pending' | 'scanned' | 'used';
  scanTime?: string;
};

type ScannerStats = {
  total: number;
  scanned: number;
  remaining: number;
  used: number;
};

const MOCK_ATTENDEES: Attendee[] = [
  { id: '1', name: 'Juan García', email: 'juan@example.com', ticketQR: 'QR001', status: 'scanned', scanTime: '10:30 AM' },
  { id: '2', name: 'María López', email: 'maria@example.com', ticketQR: 'QR002', status: 'pending' },
  { id: '3', name: 'Carlos Rodríguez', email: 'carlos@example.com', ticketQR: 'QR003', status: 'used' },
  { id: '4', name: 'Ana Martínez', email: 'ana@example.com', ticketQR: 'QR004', status: 'scanned', scanTime: '10:35 AM' },
  { id: '5', name: 'Pedro Sánchez', email: 'pedro@example.com', ticketQR: 'QR005', status: 'pending' },
  { id: '6', name: 'Laura Fernández', email: 'laura@example.com', ticketQR: 'QR006', status: 'scanned', scanTime: '10:40 AM' },
  { id: '7', name: 'Roberto Díaz', email: 'roberto@example.com', ticketQR: 'QR007', status: 'pending' },
  { id: '8', name: 'Sofia Gómez', email: 'sofia@example.com', ticketQR: 'QR008', status: 'used' },
];

export default function ScannerPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [attendees, setAttendees] = useState<Attendee[]>(MOCK_ATTENDEES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [stats, setStats] = useState<ScannerStats>({
    total: 0,
    scanned: 0,
    remaining: 0,
    used: 0,
  });

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
      setError('No tienes permiso para acceder a esta página');
      return;
    }

    cargarDatos();
  }, [session, isPending, eventId, router, isMounted]);

  useEffect(() => {
    calcularStats();
  }, [attendees]);

  const calcularStats = () => {
    const total = attendees.length;
    const scanned = attendees.filter(a => a.status === 'scanned').length;
    const used = attendees.filter(a => a.status === 'used').length;
    const remaining = total - scanned - used;

    setStats({ total, scanned, remaining, used });
  };

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      // Por ahora usamos mock data, en producción sería:
      // const response = await fetch(`/api/eventos/${eventId}/attendees`);
      // const data = await response.json();
      // setAttendees(data.attendees);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos del evento');
    } finally {
      setLoading(false);
    }
  };

  const handleScanResult = async (qrCode: string) => {
    try {
      const attendee = attendees.find(a => a.ticketQR === qrCode);

      if (!attendee) {
        setError('Código QR no encontrado');
        setTimeout(() => setError(null), 3000);
        return;
      }

      if (attendee.status === 'used') {
        setError('Esta entrada ya ha sido utilizada');
        setTimeout(() => setError(null), 3000);
        return;
      }

      const updated = attendees.map(a =>
        a.id === attendee.id
          ? { ...a, status: 'scanned' as const, scanTime: new Date().toLocaleTimeString('es-ES') }
          : a,
      );

      setAttendees(updated);
      setSelectedAttendee(updated.find(a => a.id === attendee.id) || null);
      setError(null);
    } catch (err) {
      console.error('Error al procesar escaneo:', err);
      setError('Error al procesar el QR');
      setTimeout(() => setError(null), 3000);
    }
  };

  const filteredAttendees = attendees.filter(
    attendee =>
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.ticketQR.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isMounted || isPending || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Cargando scanner...</div>
      </div>
    );
  }

  if (error && error === 'No tienes permiso para acceder a esta página') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-4xl mb-4">🚫</div>
          <div className="text-red-400 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-8">
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-4">Scanner de Entradas</h1>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <div className="text-gray-400 text-sm mb-1">Total</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-800">
              <div className="text-green-400 text-sm mb-1">Escaneadas</div>
              <div className="text-2xl font-bold text-green-400">{stats.scanned}</div>
            </div>
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-800">
              <div className="text-yellow-400 text-sm mb-1">Pendientes</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.remaining}</div>
            </div>
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-800">
              <div className="text-blue-400 text-sm mb-1">Utilizadas</div>
              <div className="text-2xl font-bold text-blue-400">{stats.used}</div>
            </div>
          </div>

          {/* Buscador */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por nombre, email o QR..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Scanner */}
        <div className="mt-6 bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4">Escanear QR</h2>
          <div className="space-y-4">
            <div className="bg-black rounded-lg p-8 flex flex-col items-center justify-center min-h-64 border border-gray-700">
              <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p className="text-gray-400 text-center mb-6">Apunta tu cámara a un código QR o usa el campo de abajo para simularlo</p>
              
              <input
                type="text"
                placeholder="Ingresa un código QR (ej: QR001)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = (e.target as HTMLInputElement).value.trim();
                    if (value) {
                      handleScanResult(value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
                className="w-full max-w-sm bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-center"
              />
              <p className="text-gray-500 text-xs mt-3">Presiona Enter para validar</p>
            </div>
          </div>
          {error && error !== 'No tienes permiso para acceder a esta página' && (
            <div className="mt-4 bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Resultado del último escaneo */}
        {selectedAttendee && (
          <div className="mt-6 bg-green-900/20 border border-green-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✓</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-green-400 mb-2">{selectedAttendee.name}</h3>
                <p className="text-green-300 text-sm mb-1">{selectedAttendee.email}</p>
                <p className="text-green-300 text-sm">Código: {selectedAttendee.ticketQR}</p>
                <p className="text-green-300 text-sm">Hora de escaneo: {selectedAttendee.scanTime}</p>
              </div>
            </div>
          </div>
        )}

        {/* Listado de asistentes */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Asistentes ({filteredAttendees.length})</h2>

          {filteredAttendees.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-lg border border-gray-800">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-400">No se encontraron resultados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAttendees.map(attendee => (
                <div
                  key={attendee.id}
                  className={`bg-gray-900 border rounded-lg p-4 flex items-center justify-between transition-all ${
                    attendee.status === 'pending'
                      ? 'border-gray-800'
                      : attendee.status === 'scanned'
                        ? 'border-green-800 bg-green-900/10'
                        : 'border-blue-800 bg-blue-900/10 opacity-75'
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{attendee.name}</h3>
                    <p className="text-sm text-gray-400">{attendee.email}</p>
                    <p className="text-xs text-gray-500">QR: {attendee.ticketQR}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {attendee.scanTime && <span className="text-xs text-gray-400">{attendee.scanTime}</span>}
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        attendee.status === 'pending'
                          ? 'bg-yellow-900 text-yellow-300'
                          : attendee.status === 'scanned'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-blue-900 text-blue-300'
                      }`}
                    >
                      {attendee.status === 'pending' ? 'Pendiente' : attendee.status === 'scanned' ? 'Escaneada' : 'Utilizada'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
