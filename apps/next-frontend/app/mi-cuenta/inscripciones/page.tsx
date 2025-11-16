'use client';

import { useSession } from '@/lib/auth-client';
import { Navbar } from '@/components/navbar';
import { Calendar, MapPin, QrCode, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Inscription {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  qrCode: string;
  inscriptionDate: string;
  status: 'validated' | 'pending' | 'cancelled';
}

export default function InscripcionesPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;

    if (!session?.user) {
      window.location.href = '/';
      return;
    }

    // TODO: Cargar las inscripciones del usuario desde la API
    setIsLoading(false);
  }, [session, sessionLoading]);

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
          {inscriptions.length === 0 ? (
            <div className="rounded-lg border border-stone-700 bg-stone-900/50 p-12 text-center">
              <QrCode className="mx-auto mb-4 h-12 w-12 text-stone-500" />
              <h3 className="mb-2 text-lg font-medium text-stone-300">No tienes inscripciones</h3>
              <p className="text-stone-400 mb-6">
                Aún no te has inscrito en ningún evento gratuito
              </p>
              <a
                href="/"
                className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
              >
                Explorar eventos
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inscriptions.map((inscription) => (
                <div
                  key={inscription.id}
                  className="rounded-lg border border-stone-700 bg-stone-900/30 p-6 hover:bg-stone-900/50 transition-colors overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-3">
                        {inscription.eventTitle}
                      </h3>
                      <div className="space-y-2 text-sm text-stone-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          {new Date(inscription.eventDate).toLocaleDateString('es-AR')}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          {inscription.eventLocation}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(inscription.status)}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(
                          inscription.status,
                        )}`}
                      >
                        {getStatusLabel(inscription.status)}
                      </span>
                    </div>
                  </div>

                  {/* QR Code Display */}
                  <div className="bg-stone-950 rounded p-3 mb-4">
                    <div className="bg-white p-2 rounded flex justify-center">
                      <img src={inscription.qrCode} alt="QR Code" className="w-32 h-32" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-700">
                    <span>
                      Registrado:{' '}
                      {new Date(inscription.inscriptionDate).toLocaleDateString('es-AR')}
                    </span>
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
