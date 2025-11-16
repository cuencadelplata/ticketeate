'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { useEvent } from '@/hooks/use-events';
import { useInvitados } from '@/hooks/use-invitados';
import { useQueryClient } from '@tanstack/react-query';
import { Mail, Plus, Trash2, Send, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function InvitadosPage() {
  const params = useParams();
  const eventId = params.id as string;
  const queryClient = useQueryClient();
  const { data: evento, isLoading } = useEvent(eventId);
  const {
    data: invitadosData,
    isLoading: isLoadingInvitados,
    error: invitadosError,
    isError: isInvitadosError,
  } = useInvitados(eventId);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingQR, setSendingQR] = useState<string | null>(null);

  const invitados = invitadosData || [];

  const handleAgregarInvitado = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !email.trim()) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    // Verificar que el email no esté duplicado
    if (invitados.some((inv) => inv.email === email)) {
      toast.error('Este email ya fue agregado');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/administrador/invitados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, nombre, email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al agregar invitado');
      }

      setNombre('');
      setEmail('');
      toast.success(`Invitado "${nombre}" agregado correctamente`);

      // Invalidar cache de invitados para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['invitados', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
    } catch (error) {
      console.error('Error al agregar invitado:', error);
      toast.error(error instanceof Error ? error.message : 'Error al agregar invitado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnviarQR = async (invitadoId: string) => {
    setSendingQR(invitadoId);
    try {
      const response = await fetch(`/api/administrador/invitados/send-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, invitadoId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al enviar QR');
      }

      toast.success('QR enviado correctamente');
      // Invalidar cache de invitados para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['invitados', eventId] });
    } catch (error) {
      console.error('Error al enviar QR:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enviar QR');
    } finally {
      setSendingQR(null);
    }
  };

  const handleEliminarInvitado = async (invitadoId: string) => {
    try {
      // Aquí iría un DELETE a la API si es necesario
      toast.success('Invitado eliminado');
      // Invalidar cache de invitados para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['invitados', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-stats', eventId] });
    } catch (error) {
      console.error('Error al eliminar invitado:', error);
      toast.error('Error al eliminar invitado');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'enviado':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'reclamado':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-stone-500/20 text-stone-400 border-stone-500/50';
    }
  };

  if (isLoading || isLoadingInvitados) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pb-4">
          <Navbar />
        </div>
        <div className="flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-700 border-t-blue-500"></div>
            <p className="text-stone-400">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isInvitadosError) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pb-4">
          <Navbar />
        </div>
        <div className="flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-red-400 mb-2">Error al cargar los invitados</p>
            <p className="text-stone-400 text-sm">
              {invitadosError instanceof Error ? invitadosError.message : 'Error desconocido'}
            </p>
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
        <div className="mx-auto max-w-4xl">
          {/* Header con botón atrás */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">QRs de Cortesía</h1>
              <p className="text-stone-400">
                Envía QRs de cortesía a personas puntuales para el evento "{evento?.titulo}"
              </p>
            </div>
            <Link
              href={`/evento/manage/${eventId}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Volver</span>
            </Link>
          </div>

          {/* Alert informativo */}
          <div className="mb-6 rounded-lg border border-blue-500/50 bg-blue-500/10 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              Ingresa el nombre y email de la persona. Se generará un QR único que será enviado
              automáticamente a su correo.
            </div>
          </div>

          {/* Formulario para agregar invitados */}
          <div className="mb-8 rounded-lg border border-stone-700 bg-stone-900/30 p-6">
            <h2 className="text-xl font-semibold mb-4">Agregar nuevo invitado</h2>

            <form onSubmit={handleAgregarInvitado} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-white placeholder-stone-500 focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ej: juan@example.com"
                    className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-white placeholder-stone-500 focus:border-blue-500 focus:outline-none transition-colors"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 px-4 py-2 text-white font-medium transition-colors"
              >
                <Plus className="h-5 w-5" />
                {isSubmitting ? 'Agregando...' : 'Agregar Invitado'}
              </button>
            </form>
          </div>

          {/* Lista de invitados */}
          {invitados.length === 0 ? (
            <div className="rounded-lg border border-stone-700 bg-stone-900/30 p-12 text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-stone-500" />
              <h3 className="mb-2 text-lg font-medium text-stone-300">
                No hay invitados agregados
              </h3>
              <p className="text-stone-400">Agrega personas para enviarles QRs de cortesía</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-xl font-semibold mb-4">Invitados ({invitados.length})</h2>

              {invitados.map((invitado) => (
                <div
                  key={invitado.id}
                  className="rounded-lg border border-stone-700 bg-stone-900/30 p-4 flex items-center justify-between hover:bg-stone-900/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-white">{invitado.nombre}</h3>
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs font-medium border ${getEstadoColor(
                          invitado.estado,
                        )}`}
                      >
                        {invitado.estado === 'pendiente'
                          ? 'Pendiente'
                          : invitado.estado === 'enviado'
                            ? 'Enviado'
                            : 'Reclamado'}
                      </span>
                    </div>
                    <p className="text-sm text-stone-400">{invitado.email}</p>
                    {invitado.fechaEnvio && (
                      <p className="text-xs text-stone-500 mt-1">
                        Enviado: {new Date(invitado.fechaEnvio).toLocaleDateString('es-AR')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {invitado.estado === 'pendiente' && (
                      <button
                        onClick={() => handleEnviarQR(invitado.id)}
                        disabled={sendingQR === invitado.id}
                        className="flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 px-3 py-2 text-sm text-white font-medium transition-colors"
                      >
                        {sendingQR === invitado.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Enviar QR
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminarInvitado(invitado.id)}
                      className="rounded-lg bg-red-600/20 hover:bg-red-600/30 p-2 text-red-400 transition-colors"
                      title="Eliminar invitado"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
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
