'use client';

import { useState, useEffect, Suspense } from 'react';
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { resetPassword } from '@/lib/auth-client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido o expirado');
    }
  }, [token]);

  const validatePassword = () => {
    if (!password.trim()) {
      setError('La contraseña es requerida');
      return false;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Token no válido');
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        newPassword: password,
        token,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push('/sign-in');
      }, 3000);
    } catch (err: any) {
      console.error('Error:', err);
      let errorMessage = 'Error al restablecer la contraseña. Intenta nuevamente.';

      if (err?.message?.includes('expired')) {
        errorMessage = 'El enlace ha expirado. Solicita uno nuevo.';
      } else if (err?.message?.includes('invalid')) {
        errorMessage = 'El enlace no es válido. Solicita uno nuevo.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">¡Contraseña restablecida!</h2>
            <p className="mt-3 text-sm text-gray-600">
              Tu contraseña ha sido actualizada exitosamente.
            </p>
            <p className="mt-2 text-sm text-gray-500">Serás redirigido al inicio de sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Restablecer contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={loading || !token}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                disabled={loading || !token}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading || !token}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Restableciendo...
              </>
            ) : (
              'Restablecer contraseña'
            )}
          </button>
        </form>

        <div className="text-center">
          <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
