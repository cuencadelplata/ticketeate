'use client';

import { useSession } from '@/lib/auth-client';
import { Navbar } from '@/components/navbar';
import { Calendar, MapPin, QrCode, CheckCircle, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useUserInscripciones } from '@/hooks/use-user-inscripciones';
import Link from 'next/link';

export default function InscripcionesPage() {
  const { isPending: sessionLoading } = useSession();
  const { data: inscripciones = [], isLoading, error } = useUserInscripciones();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-stone-500/20 text-stone-400 border-stone-500/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated':
        return 'Validada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  if (sessionLoading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pb-4">
          <Navbar />
        </div>
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pb-4">
          <Navbar />
        </div>
        <div className="p-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-lg border border-red-700 bg-red-900/30 p-6 text-center">
              <p className="text-red-400">Error al cargar las inscripciones: {error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pb-4">
        <Navbar />
      </div>

      <div className="p-6">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <QrCode className="w-8 h-8 text-green-500" />
              <h1 className="text-4xl font-instrument-serif font-light bg-gradient-to-r from-white to-stone-300 bg-clip-text text-transparent">
                Mis Inscripciones
              </h1>
            </div>
            <p className="text-stone-400">Eventos en los que estás registrado</p>
          </div>

          {/* Contenido */}
          {inscripciones.length === 0 ? (
            <div className="rounded-lg border border-stone-700 bg-stone-900/50 p-12 text-center">
              <QrCode className="mx-auto mb-4 h-12 w-12 text-stone-500" />
              <h3 className="mb-2 text-lg font-medium text-stone-300">No tienes inscripciones</h3>
              <p className="text-stone-400 mb-6">Aún no te has inscrito en ningún evento</p>
              <Link
                href="/descubrir"
                className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
              >
                Explorar eventos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inscripciones.map((inscripcion) => (
                <div
                  key={inscripcion.inscripcionid}
                  className="rounded-lg border border-stone-700 bg-stone-900/30 overflow-hidden hover:border-stone-600 hover:bg-stone-900/50 transition-all"
                >
                  {/* Imagen del evento */}
                  {inscripcion.eventImage && (
                    <div className="relative h-40 w-full overflow-hidden bg-stone-800">
                      <img
                        src={inscripcion.eventImage}
                        alt={inscripcion.eventTitle}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-0 right-0 m-3">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
                            inscripcion.status,
                          )}`}
                        >
                          {getStatusIcon(inscripcion.status)}
                          {getStatusLabel(inscripcion.status)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Título y estado */}
                    <div className="mb-4">
                      <Link
                        href={`/evento/manage/${inscripcion.eventid}`}
                        className="block hover:text-orange-500 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-white mb-3 hover:text-orange-400">
                          {inscripcion.eventTitle}
                        </h3>
                      </Link>
                      {!inscripcion.eventImage && (
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            inscripcion.status,
                          )}`}
                        >
                          {getStatusIcon(inscripcion.status)}
                          {getStatusLabel(inscripcion.status)}
                        </span>
                      )}
                    </div>

                    {/* Información del evento */}
                    <div className="space-y-2 text-sm text-stone-400 mb-4">
                      {inscripcion.eventDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {new Date(inscripcion.eventDate).toLocaleDateString('es-AR', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      {inscripcion.eventLocation && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{inscripcion.eventLocation}</span>
                        </div>
                      )}
                    </div>

                    {/* QR Code */}
                    {inscripcion.qrCode && (
                      <div className="bg-stone-950 rounded p-3 mb-4 flex justify-center">
                        <div className="bg-white p-2 rounded">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                              inscripcion.qrData || inscripcion.qrCode,
                            )}`}
                            alt="QR Code"
                            className="w-24 h-24"
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer con fechas */}
                    <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-700">
                      <span>
                        Registrado:{' '}
                        {new Date(inscripcion.inscriptionDate).toLocaleDateString('es-AR')}
                      </span>
                      {inscripcion.qrValidated && inscripcion.qrValidationDate && (
                        <span className="text-green-400">
                          Validado:{' '}
                          {new Date(inscripcion.qrValidationDate).toLocaleDateString('es-AR')}
                        </span>
                      )}
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
