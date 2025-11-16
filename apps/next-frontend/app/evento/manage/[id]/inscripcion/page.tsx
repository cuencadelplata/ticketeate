'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Users, Loader2, Search, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Inscripcion {
  id: string;
  nombre: string;
  correo: string;
  fecha_inscripcion: string;
  codigoQR: string | null;
  validado: boolean;
  fecha_validacion: string | null;
}

interface EventoInfo {
  titulo: string;
  descripcion?: string;
}

export default function InscripcionesPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [filtradas, setFiltradas] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValidado, setFilterValidado] = useState<'todos' | 'validados' | 'pendientes'>(
    'todos',
  );
  const [eventoInfo, setEventoInfo] = useState<EventoInfo | null>(null);
  const [estadisticas, setEstadisticas] = useState({
    totalInscritos: 0,
    validados: 0,
    pendientes: 0,
  });

  const userId = session?.user?.id;

  // Cargar inscripciones
  useEffect(() => {
    if (!eventId || !userId) return;

    loadInscripciones();
    // Actualizar cada 5 segundos
    const interval = setInterval(loadInscripciones, 5000);
    return () => clearInterval(interval);
  }, [eventId, userId]);

  const loadInscripciones = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/administrador/inscripciones?eventId=${eventId}`);

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('No tienes permiso para ver las inscripciones');
          router.push('/');
          return;
        }
        throw new Error('Error al cargar inscripciones');
      }

      const data = await response.json();
      setInscripciones(data.data.inscripciones);
      setEventoInfo(data.data.evento);
      setEstadisticas(data.data.estadisticas);
    } catch (error) {
      toast.error('Error al cargar inscripciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = inscripciones;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (i) =>
          i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.correo.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtro por estado de validación
    if (filterValidado === 'validados') {
      filtered = filtered.filter((i) => i.validado);
    } else if (filterValidado === 'pendientes') {
      filtered = filtered.filter((i) => !i.validado);
    }

    setFiltradas(filtered);
  }, [inscripciones, searchTerm, filterValidado]);

  // Protección: solo el dueño del evento puede ver
  if (!sessionLoading && !session?.user?.id) {
    router.push('/');
    return null;
  }

  const handleExportCSV = () => {
    const csv = [
      ['Nombre', 'Correo', 'Fecha Inscripción', 'Validado', 'Fecha Validación'].join(','),
      ...inscripciones.map((i) =>
        [
          `"${i.nombre}"`,
          `"${i.correo}"`,
          new Date(i.fecha_inscripcion).toLocaleString('es-ES'),
          i.validado ? 'Sí' : 'No',
          i.fecha_validacion ? new Date(i.fecha_validacion).toLocaleString('es-ES') : '-',
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inscripciones-${eventId}.csv`);
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <div className="p-6 md:p-12 pt-24">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Users className="text-blue-500" size={32} />
                  Inscripciones del Evento
                </h1>
                {eventoInfo && <p className="text-stone-400 mt-2">{eventoInfo.titulo}</p>}
              </div>
              <button
                onClick={loadInscripciones}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar'
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/evento/manage/${eventId}`}
                className="px-3 py-1 text-sm text-stone-400 hover:text-white transition-colors"
              >
                ← Volver
              </Link>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-lg border border-stone-700 bg-stone-900/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm font-medium">TOTAL</p>
                  <p className="text-4xl font-bold mt-2">{estadisticas.totalInscritos}</p>
                </div>
                <Users className="text-blue-500" size={28} />
              </div>
            </div>

            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">VALIDADOS</p>
                  <p className="text-4xl font-bold mt-2">{estadisticas.validados}</p>
                </div>
                <CheckCircle className="text-green-500" size={28} />
              </div>
            </div>

            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-400 text-sm font-medium">PENDIENTES</p>
                  <p className="text-4xl font-bold mt-2">{estadisticas.pendientes}</p>
                </div>
                <AlertCircle className="text-orange-500" size={28} />
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="mb-6 space-y-4 rounded-lg border border-stone-700 bg-stone-900/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Buscar</label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-stone-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filtro */}
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">
                  Estado de Validación
                </label>
                <select
                  value={filterValidado}
                  onChange={(e) => setFilterValidado(e.target.value as any)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="validados">Validados</option>
                  <option value="pendientes">Pendientes</option>
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Descargar CSV
              </button>
            </div>
          </div>

          {/* Lista de Inscripciones */}
          {loading && inscripciones.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-stone-700 bg-stone-900/50">
              <Users className="mx-auto text-stone-500 mb-4" size={48} />
              <p className="text-stone-400">No hay inscripciones</p>
            </div>
          ) : (
            <div className="rounded-lg border border-stone-700 bg-stone-900/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-stone-700 bg-stone-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-300">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-300">
                        Correo
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-300">
                        Fecha Inscripción
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-300">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-300">
                        Fecha Validación
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-700">
                    {filtradas.map((inscripcion) => (
                      <tr key={inscripcion.id} className="hover:bg-stone-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-white">{inscripcion.nombre}</td>
                        <td className="px-6 py-4 text-sm text-stone-400">{inscripcion.correo}</td>
                        <td className="px-6 py-4 text-sm text-stone-400">
                          {new Date(inscripcion.fecha_inscripcion).toLocaleString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {inscripcion.validado ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                              <CheckCircle size={14} />
                              Validado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400">
                              <AlertCircle size={14} />
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-400">
                          {inscripcion.fecha_validacion
                            ? new Date(inscripcion.fecha_validacion).toLocaleString('es-ES', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 border-t border-stone-700 bg-stone-800/30 text-sm text-stone-400">
                Mostrando {filtradas.length} de {inscripciones.length} inscripciones
              </div>
            </div>
          )}

          {/* Link a Panel de Control del Día del Evento */}
          {estadisticas.totalInscritos > 0 && (
            <div className="mt-8 rounded-lg border border-blue-500/30 bg-blue-500/10 p-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Día del Evento</h3>
              <p className="text-blue-300/70 mb-4">
                Accede al panel de control en tiempo real para monitorear las validaciones del día
                del evento.
              </p>
              <Link
                href={`/evento/manage/${eventId}/inscripcion/control`}
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Panel de Control del Evento
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
