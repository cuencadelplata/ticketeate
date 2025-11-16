'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useSession } from '@/lib/auth-client';

interface FreeEventSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  onSuccess?: () => void;
}

export function FreeEventSignupModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onSuccess,
}: FreeEventSignupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { data: session } = useSession();

  // Si el usuario no está autenticado, usar el flujo con formulario
  const isAuthenticated = !!session?.user?.id;

  if (!isOpen) return null;

  const handleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/inscribirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          ...(isAuthenticated
            ? { userId: session?.user?.id }
            : { nombre: session?.user?.name, correo: session?.user?.email }),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al inscribirse');
      }

      setSuccess(true);

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    // Flujo original: formulario de registro para usuarios no autenticados
    return (
      <AuthenticationRequiredModal
        isOpen={isOpen}
        onClose={onClose}
        eventId={eventId}
        eventTitle={eventTitle}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-stone-900 p-6 shadow-xl">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-200 disabled:opacity-50"
        >
          <X className="h-6 w-6" />
        </button>

        {!success ? (
          <>
            {/* Encabezado */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-stone-100">{eventTitle}</h2>
              <p className="mt-2 text-sm text-stone-400">
                ¡Bienvenido! Confirma tu inscripción al evento.
              </p>
            </div>

            {/* Información del usuario */}
            <div className="mb-6 rounded-md bg-stone-800/50 border border-stone-700 p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-400">Nombre:</span>
                  <span className="text-sm font-medium text-stone-100">{session?.user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-400">Correo:</span>
                  <span className="text-sm font-medium text-stone-100">{session?.user?.email}</span>
                </div>
              </div>
            </div>

            {/* Mensaje de información */}
            <div className="mb-6 rounded-md bg-blue-500/20 border border-blue-500/50 p-3">
              <p className="text-sm text-blue-200">
                Recibirás un código QR por email que deberás usar para validar tu asistencia al
                evento.
              </p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-4 rounded-md bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-md bg-stone-800 px-4 py-2 text-stone-200 hover:bg-stone-700 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? 'Confirmando...' : 'Confirmar Inscripción'}
              </button>
            </div>
          </>
        ) : (
          /* Mensaje de éxito */
          <div className="py-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-500/20 p-3">
                <svg
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-400">¡Inscripción exitosa!</h3>
            <p className="mt-2 text-sm text-stone-400">
              Revisa tu correo para recibir tu código QR.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para usuarios no autenticados
function AuthenticationRequiredModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onSuccess,
}: FreeEventSignupModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/inscribirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          nombre: name,
          correo: email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al inscribirse');
      }

      setSuccess(true);
      setName('');
      setEmail('');

      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-lg bg-stone-900 p-6 shadow-xl">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-200 disabled:opacity-50"
        >
          <X className="h-6 w-6" />
        </button>

        {!success ? (
          <>
            {/* Encabezado */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-stone-100">{eventTitle}</h2>
              <p className="mt-2 text-sm text-stone-400">
                ¡Bienvenido! Para unirte al evento, por favor regístrate a continuación.
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Nombre */}
              <div>
                <label className="block text-sm font-medium text-stone-200 mb-1">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Tu nombre completo"
                  className="w-full rounded-md bg-stone-800 px-3 py-2 text-stone-100 placeholder-stone-500 border border-stone-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-stone-200 mb-1">Correo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="tu.correo@ejemplo.com"
                  className="w-full rounded-md bg-stone-800 px-3 py-2 text-stone-100 placeholder-stone-500 border border-stone-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                />
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="rounded-md bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-md bg-stone-800 px-4 py-2 text-stone-200 hover:bg-stone-700 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !name || !email}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {loading ? 'Registrando...' : 'Inscribirse'}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Mensaje de éxito */
          <div className="py-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-500/20 p-3">
                <svg
                  className="h-8 w-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-400">¡Inscripción exitosa!</h3>
            <p className="mt-2 text-sm text-stone-400">
              Revisa tu correo para recibir tu código QR.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
