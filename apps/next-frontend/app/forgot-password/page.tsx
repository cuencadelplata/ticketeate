'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { forgetPassword } from '@/lib/auth-client';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim()) {
      setError('El email es requerido');
      setLoading(false);
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Ingresa un email válido');
      setLoading(false);
      return;
    }

    try {
      await forgetPassword({
        email,
        redirectTo: '/reset-password',
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err?.message || 'Error al enviar el email. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br bg-black p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-stone-900 p-8 shadow-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-white">Email enviado</h2>
            <p className="mt-3 text-sm text-white">
              Hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>
            </p>
            <p className="mt-2 text-sm text-white">
              Por favor revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
          </div>

          <Link
            href="/sign-in"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-700 bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black to-black p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-stone-900 p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100">¿Olvidaste tu contraseña?</h2>
          <p className="mt-2 text-sm text-gray-100">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-100">
              Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-stone-900 py-2.5 pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/20 p-3 text-sm text-red-300 ">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar enlace de recuperación'
            )}
          </button>
        </form>

        <div className="text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1 text-sm text-gray-100 hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
