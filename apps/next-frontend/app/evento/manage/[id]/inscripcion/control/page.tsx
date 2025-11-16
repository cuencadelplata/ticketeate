'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import {
  BarChart3,
  Loader2,
  Search,
  CheckCircle,
  AlertCircle,
  Monitor,
  TrendingUp,
} from 'lucide-react';
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
}

export default function ControlEventoPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [filtradas, setFiltradas] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventoInfo, setEventoInfo] = useState<EventoInfo | null>(null);
  const [estadisticas, setEstadisticas] = useState({
    totalInscritos: 0,
    validados: 0,
    pendientes: 0,
  });
  const [filtroValidado, setFiltroValidado] = useState<'todos' | 'validados' | 'pendientes'>(
    'todos',
  );

  const userId = session?.user?.id;

  // Cargar inscripciones en tiempo real
  useEffect(() => {
    if (!eventId || !userId) return;

    loadInscripciones();
    // Actualizar cada 2 segundos para tiempo real
    const interval = setInterval(loadInscripciones, 2000);
    return () => clearInterval(interval);
  }, [eventId, userId]);

  const loadInscripciones = async () => {
    try {
      const response = await fetch(`/api/administrador/inscripciones?eventId=${eventId}`);

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('No tienes permiso');
          router.push('/');
          return;
        }
        throw new Error('Error al cargar');
      }

      const data = await response.json();
      setInscripciones(data.data.inscripciones);
      setEventoInfo(data.data.evento);
      setEstadisticas(data.data.estadisticas);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = inscripciones;

    if (searchTerm) {
      filtered = filtered.filter(
        (i) =>
          i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.correo.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filtroValidado === 'validados') {
      filtered = filtered.filter((i) => i.validado);
    } else if (filtroValidado === 'pendientes') {
      filtered = filtered.filter((i) => !i.validado);
    }

    setFiltradas(filtered);
  }, [inscripciones, searchTerm, filtroValidado]);

  if (!sessionLoading && !session?.user?.id) {
    router.push('/');
    return null;
  }

  const porcentajeValidacion =
    estadisticas.totalInscritos > 0
      ? Math.round((estadisticas.validados / estadisticas.totalInscritos) * 100)
      : 0;

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
                  <Monitor className="text-green-500" size={32} />
                  Panel de Control en Vivo
                </h1>
                {eventoInfo && <p className="text-stone-400 mt-2">{eventoInfo.titulo}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm text-stone-400 mb-2">Última actualización</p>
                <p className="text-xs text-green-400 flex items-center justify-end gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  En vivo
                </p>
              </div>
            </div>
            <Link
              href={`/evento/manage/${eventId}/inscripcion`}
              className="text-sm text-stone-400 hover:text-white transition-colors"
            >
              ← Volver a inscripciones
            </Link>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Total */}
            <div className="rounded-lg border border-stone-700 bg-stone-900/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm font-medium">TOTAL</p>
                  <p className="text-4xl font-bold mt-2">{estadisticas.totalInscritos}</p>
                </div>
                <BarChart3 className="text-blue-500" size={32} />
              </div>
            </div>

            {/* Validados */}
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium">VALIDADOS</p>
                  <p className="text-4xl font-bold mt-2">{estadisticas.validados}</p>
                </div>
                <CheckCircle className="text-green-500" size={32} />
              </div>
            </div>

            {/* Pendientes */}
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-400 text-sm font-medium">PENDIENTES</p>
                  <p className="text-4xl font-bold mt-2">{estadisticas.pendientes}</p>
                </div>
                <AlertCircle className="text-orange-500" size={32} />
              </div>
            </div>

            {/* Porcentaje */}
            <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium">VALIDACIÓN</p>
                  <p className="text-4xl font-bold mt-2">{porcentajeValidacion}%</p>
                </div>
                <TrendingUp className="text-purple-500" size={32} />
              </div>
            </div>
          </div>

          {/* Barra de Progreso */}
          <div className="mb-8 rounded-lg border border-stone-700 bg-stone-900/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Progreso de Validación</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-stone-300">Inscritos Validados</span>
                  <span className="text-sm font-medium text-green-400">
                    {estadisticas.validados} / {estadisticas.totalInscritos}
                  </span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-500"
                    style={{ width: `${porcentajeValidacion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="mb-6 rounded-lg border border-stone-700 bg-stone-900/50 p-6">
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
                    className="w-full bg-stone-800 border border-stone-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-stone-500 focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* Filtro */}
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Filtro</label>
                <select
                  value={filtroValidado}
                  onChange={(e) => setFiltroValidado(e.target.value as any)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="todos">Todos ({inscripciones.length})</option>
                  <option value="validados">Validados ({estadisticas.validados})</option>
                  <option value="pendientes">Pendientes ({estadisticas.pendientes})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Inscripciones */}
          {loading && inscripciones.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-green-500" />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-12 rounded-lg border border-stone-700 bg-stone-900/50">
              <AlertCircle className="mx-auto text-stone-500 mb-4" size={48} />
              <p className="text-stone-400">No hay inscripciones</p>
            </div>
          ) : (
            <div className="rounded-lg border border-stone-700 bg-stone-900/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-stone-700 bg-stone-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-300">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-300">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-300">
                        Correo
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-300">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-stone-300">
                        Hora Validación
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-700">
                    {filtradas.map((inscripcion, index) => (
                      <tr
                        key={inscripcion.id}
                        className={`transition-colors ${
                          inscripcion.validado
                            ? 'bg-green-500/5 hover:bg-green-500/10'
                            : 'hover:bg-stone-800/30'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-stone-400">{index + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {inscripcion.nombre}
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-400">{inscripcion.correo}</td>
                        <td className="px-6 py-4 text-sm">
                          {inscripcion.validado ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                              <CheckCircle size={14} />
                              Validado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 font-medium">
                              <AlertCircle size={14} />
                              Pendiente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-400">
                          {inscripcion.fecha_validacion
                            ? new Date(inscripcion.fecha_validacion).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
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

          {/* Nota de Actualización en Vivo */}
          <div className="mt-8 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <p className="text-sm text-green-300 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Esta página se actualiza automáticamente en tiempo real. Los datos se actualizan cada
              2 segundos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
